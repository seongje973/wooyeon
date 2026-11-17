import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { Universities, distanceKm } from '../universities.js';
import { photoUrl } from '../profile/profile.service.js';
import { blockedUserIds } from '../safety/blocks.js';

const CANDIDATE_LIMIT = 20;

interface CandidateRow {
  user_id: string;
  nickname: string;
  birth_year: number;
  bio: string;
  photo_path: string | null;
  university_id: string;
}

const ageOf = (birthYear: number) => new Date().getFullYear() - birthYear;
const universityOf = (id: string) => Universities.find((u) => u.id === id);

// 매칭은 두 사람을 정렬해 한 줄로 저장한다 (003_matching.sql의 check와 맞춘다).
export const matchPair = (x: string, y: string) => (x < y ? { user_a: x, user_b: y } : { user_a: y, user_b: x });

@Injectable()
export class MatchingService {
  private async myProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, gender, university_id, radius_km')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('프로필을 먼저 만들어 주세요.');
    return data;
  }

  async candidates(userId: string) {
    const me = await this.myProfile(userId);
    const home = universityOf(me.university_id);
    if (!home) throw new NotFoundException('학교 정보를 찾을 수 없습니다.');

    const nearby = new Map(
      Universities.map((u) => [u.id, distanceKm(home, u)] as const)
        .filter(([, d]) => d <= me.radius_km)
        .sort(([, a], [, b]) => a - b),
    );

    // 이미 고른 사람·차단한 사람을 빼는 일은 DB 함수가 한다 (009_matching_candidates.sql).
    // 그 목록을 요청 주소에 실으면 많이 고른 사용자는 주소 길이 한도를 넘는다.
    const { data, error } = await supabase.rpc('matching_candidates', {
      p_user: userId,
      p_gender: me.gender,
      p_universities: [...nearby.keys()],
      p_limit: CANDIDATE_LIMIT,
    });
    if (error) throw error;

    return ((data ?? []) as CandidateRow[]).map((p) => ({
      userId: p.user_id,
      nickname: p.nickname,
      age: ageOf(p.birth_year),
      bio: p.bio,
      photoUrl: photoUrl(p.photo_path),
      universityName: universityOf(p.university_id)?.name ?? '',
      distanceKm: Math.round((nearby.get(p.university_id) ?? 0) * 10) / 10,
    }));
  }

  async swipe(userId: string, targetUserId: string, liked: boolean) {
    if (targetUserId === userId) throw new BadRequestException('자기 자신은 고를 수 없습니다.');
    const me = await this.myProfile(userId);
    const { data: target, error: targetError } = await supabase
      .from('profiles')
      .select('user_id, gender, university_id')
      .eq('user_id', targetUserId)
      .maybeSingle();
    if (targetError) throw targetError;
    // 후보로 나올 수 있는 사람만 고를 수 있다 (candidates와 같은 조건).
    const home = universityOf(me.university_id);
    const school = target && universityOf(target.university_id);
    if (
      !target ||
      !home ||
      !school ||
      target.gender === me.gender ||
      distanceKm(home, school) > me.radius_km ||
      (await blockedUserIds(userId)).has(targetUserId)
    ) {
      throw new NotFoundException('상대를 찾을 수 없습니다.');
    }

    const { error } = await supabase.from('likes').insert({ from_user: userId, to_user: targetUserId, liked });
    if (error?.code === '23505') throw new ConflictException('이미 고른 상대입니다.');
    if (error) throw error;
    if (!liked) return { matched: false };

    const { data: back, error: backError } = await supabase
      .from('likes')
      .select('id')
      .eq('from_user', targetUserId)
      .eq('to_user', userId)
      .eq('liked', true)
      .maybeSingle();
    if (backError) throw backError;
    if (!back) return { matched: false };

    // 두 사람이 거의 동시에 좋아요를 누르면 둘 다 여기로 온다. 먼저 넣은 매칭을 그대로 쓴다.
    const pair = matchPair(userId, targetUserId);
    const { error: insertError } = await supabase
      .from('matches')
      .upsert(pair, { onConflict: 'user_a,user_b', ignoreDuplicates: true });
    if (insertError) throw insertError;
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('id')
      .eq('user_a', pair.user_a)
      .eq('user_b', pair.user_b)
      .single();
    if (matchError) throw matchError;
    return { matched: true, matchId: match.id };
  }

  async matches(userId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('id, user_a, user_b, created_at')
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    const blocked = await blockedUserIds(userId);
    const visible = (data ?? []).filter((m) => !blocked.has(m.user_a === userId ? m.user_b : m.user_a));
    if (!visible.length) return [];

    const otherIds = visible.map((m) => (m.user_a === userId ? m.user_b : m.user_a));
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname, birth_year, photo_path, university_id')
      .in('user_id', otherIds);
    if (profileError) throw profileError;
    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    return visible.flatMap((m) => {
      const other = byId.get(m.user_a === userId ? m.user_b : m.user_a);
      if (!other) return [];
      return [
        {
          matchId: m.id,
          matchedAt: m.created_at,
          user: {
            userId: other.user_id,
            nickname: other.nickname,
            age: ageOf(other.birth_year),
            photoUrl: photoUrl(other.photo_path),
            universityName: universityOf(other.university_id)?.name ?? '',
          },
        },
      ];
    });
  }

  // 대화도 함께 지워진다 (messages.match_id on delete cascade). 좋아요 기록은 남겨서 다시 후보로 나오지 않는다.
  async unmatch(userId: string, matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .delete()
      .eq('id', matchId)
      .or(`user_a.eq.${userId},user_b.eq.${userId}`)
      .select('id');
    if (error) throw error;
    if (!data?.length) throw new NotFoundException('매칭을 찾을 수 없습니다.');
    return { unmatched: true };
  }
}
