import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { Universities, distanceKm } from '../universities.js';
import { photoUrl } from '../profile/profile.service.js';
import { blockedUserIds } from '../safety/blocks.js';

type Gender = 'male' | 'female';

interface PartyRow {
  id: string;
  host: string;
  university_id: string;
  title: string;
  description: string;
  place: string;
  meet_at: string;
  size: number;
}

interface MemberRow {
  party_id: string;
  user_id: string;
  gender: Gender;
}

export interface PartyInput {
  title: string;
  description: string;
  place: string;
  meetAt: string;
  size: number;
}

const PARTY_COLUMNS = 'id, host, university_id, title, description, place, meet_at, size';
const universityOf = (id: string) => Universities.find((u) => u.id === id);
const ageOf = (birthYear: number) => new Date().getFullYear() - birthYear;

export const parsePartyInput = (body: Record<string, unknown> | undefined): PartyInput => {
  const { title, description = '', place, meetAt, size } = body ?? {};
  if (typeof title !== 'string' || title.trim().length < 1 || title.trim().length > 40) {
    throw new BadRequestException('제목은 1~40자여야 합니다.');
  }
  if (typeof description !== 'string' || description.length > 500) {
    throw new BadRequestException('소개는 500자 이내여야 합니다.');
  }
  if (typeof place !== 'string' || place.trim().length < 1 || place.trim().length > 60) {
    throw new BadRequestException('장소는 1~60자여야 합니다.');
  }
  if (typeof meetAt !== 'string' || Number.isNaN(Date.parse(meetAt)) || Date.parse(meetAt) <= Date.now()) {
    throw new BadRequestException('만나는 시간은 지금 이후여야 합니다.');
  }
  if (size !== 2 && size !== 3 && size !== 4) throw new BadRequestException('인원은 2, 3, 4 중 하나여야 합니다.');
  return { title: title.trim(), description: description.trim(), place: place.trim(), meetAt, size };
};

@Injectable()
export class PartyService {
  private async myProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('user_id, gender, university_id, radius_km')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new NotFoundException('프로필을 먼저 만들어 주세요.');
    return data as { user_id: string; gender: Gender; university_id: string; radius_km: number };
  }

  private async members(partyIds: string[]) {
    if (!partyIds.length) return [];
    const { data, error } = await supabase
      .from('party_members')
      .select('party_id, user_id, gender')
      .in('party_id', partyIds);
    if (error) throw error;
    return (data ?? []) as MemberRow[];
  }

  private summary(party: PartyRow, members: MemberRow[], userId: string, home?: (typeof Universities)[number]) {
    const mine = members.filter((m) => m.party_id === party.id);
    const school = universityOf(party.university_id);
    return {
      id: party.id,
      title: party.title,
      description: party.description,
      place: party.place,
      meetAt: party.meet_at,
      size: party.size,
      universityName: school?.name ?? '',
      distanceKm: home && school ? Math.round(distanceKm(home, school) * 10) / 10 : 0,
      maleCount: mine.filter((m) => m.gender === 'male').length,
      femaleCount: mine.filter((m) => m.gender === 'female').length,
      isHost: party.host === userId,
      joined: mine.some((m) => m.user_id === userId),
    };
  }

  // 차단한 사람(또는 나를 차단한 사람)이 들어 있는 파티는 보이지 않는다.
  // 내가 이미 들어간 파티는 나갈 수 있어야 하므로 남기고, 참여자 목록에서 그 사람만 뺀다.
  private hiddenFrom(party: PartyRow, members: MemberRow[], userId: string, blocked: Set<string>) {
    const mine = members.filter((m) => m.party_id === party.id);
    if (mine.some((m) => m.user_id === userId)) return false;
    return blocked.has(party.host) || mine.some((m) => blocked.has(m.user_id));
  }

  // 내 만날 범위 안 학교에서 열리는, 아직 지나지 않은 파티. 차단한 사람이 있는 파티는 빼고 가까운 시간 순.
  async list(userId: string) {
    const me = await this.myProfile(userId);
    const home = universityOf(me.university_id);
    if (!home) throw new NotFoundException('학교 정보를 찾을 수 없습니다.');
    const nearby = Universities.filter((u) => distanceKm(home, u) <= me.radius_km).map((u) => u.id);

    const { data, error } = await supabase
      .from('parties')
      .select(PARTY_COLUMNS)
      .in('university_id', nearby)
      .gt('meet_at', new Date().toISOString())
      .order('meet_at', { ascending: true })
      .limit(50);
    if (error) throw error;
    const blocked = await blockedUserIds(userId);
    const all = (data ?? []) as PartyRow[];
    const members = await this.members(all.map((p) => p.id));
    return all
      .filter((p) => !this.hiddenFrom(p, members, userId, blocked))
      .map((p) => this.summary(p, members, userId, home));
  }

  async create(userId: string, input: PartyInput) {
    const me = await this.myProfile(userId);
    const { data, error } = await supabase
      .from('parties')
      .insert({
        host: userId,
        university_id: me.university_id,
        title: input.title,
        description: input.description,
        place: input.place,
        meet_at: new Date(input.meetAt).toISOString(),
        size: input.size,
      })
      .select('id')
      .single();
    if (error) throw error;
    const { error: joinError } = await supabase
      .from('party_members')
      .insert({ party_id: data.id, user_id: userId, gender: me.gender });
    if (joinError) {
      // 연 사람이 없는 파티가 남지 않게 되돌린다.
      await supabase.from('parties').delete().eq('id', data.id);
      throw joinError;
    }
    return this.detail(userId, data.id);
  }

  async detail(userId: string, partyId: string) {
    const { data: party, error } = await supabase.from('parties').select(PARTY_COLUMNS).eq('id', partyId).maybeSingle();
    if (error) throw error;
    const blocked = await blockedUserIds(userId);
    if (!party) throw new NotFoundException('파티를 찾을 수 없습니다.');
    const members = await this.members([partyId]);
    if (this.hiddenFrom(party as PartyRow, members, userId, blocked)) {
      throw new NotFoundException('파티를 찾을 수 없습니다.');
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname, birth_year, photo_path, university_id')
      .in(
        'user_id',
        members.filter((m) => !blocked.has(m.user_id)).map((m) => m.user_id),
      );
    if (profileError) throw profileError;
    const me = await this.myProfile(userId);

    return {
      ...this.summary(party as PartyRow, members, userId, universityOf(me.university_id)),
      members: (profiles ?? []).map((p) => ({
        userId: p.user_id,
        nickname: p.nickname,
        age: ageOf(p.birth_year),
        photoUrl: photoUrl(p.photo_path),
        universityName: universityOf(p.university_id)?.name ?? '',
        gender: members.find((m) => m.user_id === p.user_id)?.gender,
        isHost: p.user_id === party.host,
      })),
    };
  }

  async join(userId: string, partyId: string) {
    const me = await this.myProfile(userId);
    const party = await this.detail(userId, partyId);
    if (party.joined) throw new ConflictException('이미 참여한 파티입니다.');
    if (party.distanceKm > me.radius_km) throw new NotFoundException('파티를 찾을 수 없습니다.');
    if (new Date(party.meetAt).getTime() <= Date.now()) throw new BadRequestException('이미 지난 파티입니다.');
    const taken = me.gender === 'male' ? party.maleCount : party.femaleCount;
    if (taken >= party.size) throw new ConflictException('자리가 모두 찼습니다.');

    const { error } = await supabase
      .from('party_members')
      .insert({ party_id: partyId, user_id: userId, gender: me.gender });
    // 23505: 이미 참여, 23514: 동시에 들어와 자리가 찬 경우 (006_parties.sql의 트리거)
    if (error?.code === '23505') throw new ConflictException('이미 참여한 파티입니다.');
    if (error?.code === '23514') throw new ConflictException('자리가 모두 찼습니다.');
    if (error) throw error;
    return this.detail(userId, partyId);
  }

  // 연 사람이 나가면 파티를 닫는다.
  async leave(userId: string, partyId: string) {
    const party = await this.detail(userId, partyId);
    if (!party.joined) throw new NotFoundException('참여하지 않은 파티입니다.');
    if (party.isHost) {
      const { error } = await supabase.from('parties').delete().eq('id', partyId).eq('host', userId);
      if (error) throw error;
      return { left: true, closed: true };
    }
    const { error } = await supabase.from('party_members').delete().eq('party_id', partyId).eq('user_id', userId);
    if (error) throw error;
    return { left: true, closed: false };
  }
}
