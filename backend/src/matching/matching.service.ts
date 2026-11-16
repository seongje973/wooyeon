import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { Universities, distanceKm } from '../universities.js';
import { photoUrl } from '../profile/profile.service.js';

const CANDIDATE_LIMIT = 20;

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
      Universities.map((u) => [u.id, distanceKm(home, u)] as const).filter(([, d]) => d <= me.radius_km),
    );

    const { data: swiped, error: swipedError } = await supabase
      .from('likes')
      .select('to_user')
      .eq('from_user', userId);
    if (swipedError) throw swipedError;
    const excluded = [userId, ...(swiped ?? []).map((s) => s.to_user)];

    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, nickname, birth_year, bio, photo_path, university_id')
      .in('university_id', [...nearby.keys()])
      .neq('gender', me.gender)
      .not('user_id', 'in', `(${excluded.join(',')})`);
    if (error) throw error;

    return (data ?? [])
      .map((p) => ({
        userId: p.user_id,
        nickname: p.nickname,
        age: ageOf(p.birth_year),
        bio: p.bio,
        photoUrl: photoUrl(p.photo_path),
        universityName: universityOf(p.university_id)?.name ?? '',
        distanceKm: Math.round((nearby.get(p.university_id) ?? 0) * 10) / 10,
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, CANDIDATE_LIMIT);
  }

  async swipe(userId: string, targetUserId: string, liked: boolean) {
    if (targetUserId === userId) throw new BadRequestException('자기 자신은 고를 수 없습니다.');
    await this.myProfile(userId);
    const { data: target, error: targetError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('user_id', targetUserId)
      .maybeSingle();
    if (targetError) throw targetError;
    if (!target) throw new NotFoundException('상대를 찾을 수 없습니다.');

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
    if (!data?.length) return [];

    const otherIds = data.map((m) => (m.user_a === userId ? m.user_b : m.user_a));
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname, birth_year, photo_path, university_id')
      .in('user_id', otherIds);
    if (profileError) throw profileError;
    const byId = new Map((profiles ?? []).map((p) => [p.user_id, p]));

    return data.flatMap((m) => {
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
}
