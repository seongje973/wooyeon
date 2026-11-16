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

const hashCode = (code: string) => createHash('sha256').update(code).digest();

@Injectable()
export class VerificationService {
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
      .select('sent_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (currentError) throw currentError;
    const tooSoon = new HttpException('잠시 후 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    if (current && Date.now() - new Date(current.sent_at).getTime() < RESEND_INTERVAL_MS) throw tooSoon;

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const now = new Date();
    const challenge = {
      email,
      university_id: university.id,
      code_hash: hashCode(code).toString('hex'),
      attempts: 0,
      sent_at: now.toISOString(),
      expires_at: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
      verified_at: null,
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
      .select('email, university_id, code_hash, attempts, expires_at, verified_at')
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
    const { data: claimed, error: claimError } = await supabase
      .from('school_verifications')
      .update({ attempts: row.attempts + 1 })
      .eq('user_id', userId)
      .eq('code_hash', row.code_hash)
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
      .eq('code_hash', row.code_hash)
      .select('user_id');
    // 같은 이메일을 다른 계정이 먼저 인증하면 unique 인덱스에서 막힌다.
    if (verifyError?.code === '23505') {
      throw new ConflictException('이미 다른 계정에서 인증한 이메일입니다.');
    }
    if (verifyError) throw verifyError;
    if (!verified?.length) throw new BadRequestException('인증번호가 바뀌었습니다. 새 인증번호를 입력해 주세요.');
    return { universityId: row.university_id, email: row.email };
  }
}
