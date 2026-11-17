import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'node:crypto';
import { supabase } from '../supabase.js';
import { findUniversityByEmail } from '../universities.js';
import { sendVerificationMail } from './mail.js';

const CODE_TTL_MS = 10 * 60 * 1000;
const RESEND_INTERVAL_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
// 다시 받을 때마다 시도 횟수가 0으로 돌아가므로, 하루 발송 횟수를 묶어 맞혀 보기와 메일 폭탄을 막는다.
const MAX_SENDS_PER_DAY = 5;
const SEND_WINDOW_MS = 24 * 60 * 60 * 1000;

const hashCode = (code: string) => createHash('sha256').update(code).digest();

@Injectable()
export class VerificationService {
  async status(userId: string) {
    const { data, error } = await supabase
      .from('school_verifications')
      .select('university_id, verified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return data?.verified_at ? { verified: true, universityId: data.university_id } : { verified: false };
  }

  async send(userId: string, rawEmail: string) {
    const email = rawEmail.trim().toLowerCase();
    const university = findUniversityByEmail(email);
    if (!university) throw new BadRequestException('지원하지 않는 학교 이메일입니다.');

    const { data: taken, error: takenError } = await supabase
      .from('school_verifications')
      .select('user_id')
      .eq('email', email)
      .not('verified_at', 'is', null)
      .neq('user_id', userId)
      .maybeSingle();
    if (takenError) throw takenError;
    if (taken) throw new ConflictException('이미 다른 계정에서 인증한 이메일입니다.');

    const { data: current, error: currentError } = await supabase
      .from('school_verifications')
      .select('sent_at, verified_at, send_count, send_window_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (currentError) throw currentError;
    // 인증을 마친 행을 새 인증번호로 덮어쓰면 인증이 풀리고, 그 이메일을 다른 계정이 다시 쓸 수 있게 된다.
    if (current?.verified_at) throw new ConflictException('이미 학교 인증을 마쳤습니다.');
    const tooSoon = new HttpException('잠시 후 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    if (current && Date.now() - new Date(current.sent_at).getTime() < RESEND_INTERVAL_MS) throw tooSoon;

    const now = new Date();
    const inWindow =
      current?.send_window_at && now.getTime() - new Date(current.send_window_at).getTime() < SEND_WINDOW_MS;
    if (inWindow && current.send_count >= MAX_SENDS_PER_DAY) {
      throw new HttpException('오늘은 더 받을 수 없습니다. 내일 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const challenge = {
      email,
      university_id: university.id,
      code_hash: hashCode(code).toString('hex'),
      attempts: 0,
      sent_at: now.toISOString(),
      expires_at: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
      send_count: inWindow ? current.send_count + 1 : 1,
      send_window_at: inWindow ? current.send_window_at : now.toISOString(),
    };
    // 동시에 들어온 요청 중 하나만 새 인증번호를 만든다. 첫 요청은 primary key로,
    // 다시 받기는 앞에서 읽은 sent_at이 그대로일 때만 바꾸는 것으로 가린다.
    if (!current) {
      const { error } = await supabase.from('school_verifications').insert({ user_id: userId, ...challenge });
      if (error?.code === '23505') throw tooSoon;
      if (error) throw error;
    } else {
      const { data: updated, error } = await supabase
        .from('school_verifications')
        .update(challenge)
        .eq('user_id', userId)
        .eq('sent_at', current.sent_at)
        .is('verified_at', null)
        .select('user_id');
      if (error) throw error;
      if (!updated?.length) throw tooSoon;
    }

    await sendVerificationMail(email, code);
    return { universityId: university.id };
  }

  async verify(userId: string, code: string) {
    const { data: row, error } = await supabase
      .from('school_verifications')
      .select('email, university_id, code_hash, attempts, sent_at, expires_at, verified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!row || !row.code_hash || row.verified_at) {
      throw new BadRequestException('먼저 인증번호를 받아 주세요.');
    }
    if (new Date(row.expires_at).getTime() < Date.now()) {
      throw new BadRequestException('인증번호가 만료됐습니다. 다시 받아 주세요.');
    }
    if (row.attempts >= MAX_ATTEMPTS) {
      throw new HttpException('시도 횟수를 넘었습니다. 다시 받아 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    }

    // 비교하기 전에 시도 한 번을 먼저 기록한다. 읽은 attempts 값이 그대로일 때만 올라가서,
    // 동시에 여러 번 보내도 MAX_ATTEMPTS번보다 많이 비교하지 않는다.
    // 인증번호마다 sent_at이 달라서 이것으로 같은 인증번호인지 가린다 (번호가 우연히 같아도 구분된다).
    const { data: claimed, error: claimError } = await supabase
      .from('school_verifications')
      .update({ attempts: row.attempts + 1 })
      .eq('user_id', userId)
      .eq('sent_at', row.sent_at)
      .eq('attempts', row.attempts)
      .select('user_id');
    if (claimError) throw claimError;
    if (!claimed?.length) throw new ConflictException('잠시 후 다시 시도해 주세요.');

    if (!timingSafeEqual(hashCode(code), Buffer.from(row.code_hash, 'hex'))) {
      throw new BadRequestException('인증번호가 맞지 않습니다.');
    }

    // 확인한 인증번호가 그 사이 새 인증번호로 바뀌었으면 인증하지 않는다.
    const { data: verified, error: verifyError } = await supabase
      .from('school_verifications')
      .update({ verified_at: new Date().toISOString(), code_hash: null })
      .eq('user_id', userId)
      .eq('sent_at', row.sent_at)
      .gt('expires_at', new Date().toISOString())
      .is('verified_at', null)
      .select('user_id');
    // 같은 이메일을 다른 계정이 먼저 인증하면 unique 인덱스에서 막힌다.
    if (verifyError?.code === '23505') {
      throw new ConflictException('이미 다른 계정에서 인증한 이메일입니다.');
    }
    if (verifyError) throw verifyError;
    if (!verified?.length) throw new BadRequestException('인증번호가 바뀌었거나 만료됐습니다. 다시 받아 주세요.');
    return { universityId: row.university_id, email: row.email };
  }
}
