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
    if (current?.sent_at && Date.now() - new Date(current.sent_at).getTime() < RESEND_INTERVAL_MS) {
      throw new HttpException('잠시 후 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const now = new Date();
    const { error } = await supabase.from('school_verifications').upsert({
      user_id: userId,
      email,
      university_id: university.id,
      code_hash: hashCode(code).toString('hex'),
      attempts: 0,
      sent_at: now.toISOString(),
      expires_at: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
      verified_at: null,
    });
    if (error) throw error;

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

    if (!timingSafeEqual(hashCode(code), Buffer.from(row.code_hash, 'hex'))) {
      const { error: updateError } = await supabase
        .from('school_verifications')
        .update({ attempts: row.attempts + 1 })
        .eq('user_id', userId);
      if (updateError) throw updateError;
      throw new BadRequestException('인증번호가 맞지 않습니다.');
    }

    const { error: verifyError } = await supabase
      .from('school_verifications')
      .update({ verified_at: new Date().toISOString(), code_hash: null })
      .eq('user_id', userId);
    // 같은 이메일을 다른 계정이 먼저 인증하면 unique 인덱스에서 막힌다.
    if (verifyError?.code === '23505') {
      throw new ConflictException('이미 다른 계정에서 인증한 이메일입니다.');
    }
    if (verifyError) throw verifyError;
    return { universityId: row.university_id, email: row.email };
  }
}
