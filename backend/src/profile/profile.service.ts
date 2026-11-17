import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { PHOTO_BUCKET, removePhotos } from './photos.js';

export const RADIUS_OPTIONS = [5, 10, 20];

export interface ProfileInput {
  nickname: string;
  birthYear: number;
  gender: 'male' | 'female';
  bio: string;
  photoPath: string | null;
  radiusKm: number;
}

interface ProfileRow {
  user_id: string;
  nickname: string;
  birth_year: number;
  gender: 'male' | 'female';
  bio: string;
  photo_path: string | null;
  university_id: string;
  radius_km: number;
}

export const photoUrl = (path: string | null) =>
  path ? supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl : null;

export const toProfileResponse = (row: ProfileRow) => ({
  userId: row.user_id,
  nickname: row.nickname,
  birthYear: row.birth_year,
  gender: row.gender,
  bio: row.bio,
  photoPath: row.photo_path,
  photoUrl: photoUrl(row.photo_path),
  universityId: row.university_id,
  radiusKm: row.radius_km,
});

export const parseProfileInput = (userId: string, body: Record<string, unknown>): ProfileInput => {
  const { nickname, birthYear, gender, bio, photoPath, radiusKm } = body ?? {};
  const thisYear = new Date().getFullYear();
  if (typeof nickname !== 'string' || nickname.trim().length < 1 || nickname.trim().length > 20) {
    throw new BadRequestException('닉네임은 1~20자여야 합니다.');
  }
  // 만 19세 이상 대학생을 기준으로, 너무 큰 나이는 입력 실수로 본다.
  if (typeof birthYear !== 'number' || !Number.isInteger(birthYear) || birthYear > thisYear - 19 || birthYear < thisYear - 40) {
    throw new BadRequestException('출생 연도가 올바르지 않습니다.');
  }
  if (gender !== 'male' && gender !== 'female') throw new BadRequestException('성별이 올바르지 않습니다.');
  if (bio !== undefined && (typeof bio !== 'string' || bio.length > 300)) {
    throw new BadRequestException('소개는 300자 이하여야 합니다.');
  }
  if (photoPath !== undefined && photoPath !== null && (typeof photoPath !== 'string' || !photoPath.startsWith(`${userId}/`) || !/^[\w.-]+$/.test(photoPath.slice(userId.length + 1)))) {
    throw new BadRequestException('사진 경로가 올바르지 않습니다.');
  }
  if (typeof radiusKm !== 'number' || !RADIUS_OPTIONS.includes(radiusKm)) {
    throw new BadRequestException('반경은 5, 10, 20km 중 하나여야 합니다.');
  }
  return {
    nickname: nickname.trim(),
    birthYear,
    gender,
    bio: (bio as string | undefined) ?? '',
    photoPath: (photoPath as string | null | undefined) ?? null,
    radiusKm,
  };
};

@Injectable()
export class ProfileService {
  async getMine(userId: string) {
    const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('프로필이 없습니다.');
    return toProfileResponse(data);
  }

  async upsertMine(userId: string, input: ProfileInput) {
    // 학교는 사용자가 고르지 않고, 인증을 마친 학교 이메일에서 가져온다.
    const { data: verification, error: verificationError } = await supabase
      .from('school_verifications')
      .select('university_id, verified_at')
      .eq('user_id', userId)
      .maybeSingle();
    if (verificationError) throw verificationError;
    if (!verification?.verified_at) throw new ForbiddenException('학교 인증을 먼저 해 주세요.');

    // 성별은 후보와 파티 자리를 정하므로, 한 번 정하면 바꾸지 못한다. 출생 연도도 같이 묶는다.
    const { data: existing, error: existingError } = await supabase
      .from('profiles')
      .select('gender, birth_year')
      .eq('user_id', userId)
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing && (existing.gender !== input.gender || existing.birth_year !== input.birthYear)) {
      throw new BadRequestException('성별과 출생 연도는 바꿀 수 없습니다.');
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        nickname: input.nickname,
        birth_year: input.birthYear,
        gender: input.gender,
        bio: input.bio,
        photo_path: input.photoPath,
        university_id: verification.university_id,
        radius_km: input.radiusKm,
        updated_at: new Date().toISOString(),
      })
      .select('*')
      .single();
    if (error) throw error;
    // 공개 버킷이라 바꾸기 전 사진도 주소를 알면 계속 보인다. 지금 쓰는 사진만 남긴다.
    await removePhotos(userId, input.photoPath);
    return toProfileResponse(data);
  }
}
