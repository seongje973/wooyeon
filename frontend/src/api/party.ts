import { request } from './client';
import { Gender } from './profile';

export interface PartySummary {
  id: string;
  title: string;
  description: string;
  place: string;
  meetAt: string;
  size: number;
  universityName: string;
  distanceKm: number;
  maleCount: number;
  femaleCount: number;
  isHost: boolean;
  joined: boolean;
}

export interface PartyMember {
  userId: string;
  nickname: string;
  age: number;
  photoUrl: string | null;
  universityName: string;
  gender: Gender;
  isHost: boolean;
}

export interface PartyDetail extends PartySummary {
  members: PartyMember[];
}

export interface PartyInput {
  title: string;
  description: string;
  place: string;
  meetAt: string;
  size: number;
}

export const PARTY_SIZES = [2, 3, 4];

export const partyApi = {
  list: () => request<PartySummary[]>('/parties'),

  create: (input: PartyInput) => request<PartyDetail>('/parties', 'POST', input),

  detail: (partyId: string) => request<PartyDetail>(`/parties/${partyId}`),

  join: (partyId: string) => request<PartyDetail>(`/parties/${partyId}/members`, 'POST'),

  leave: (partyId: string) =>
    request<{ left: true; closed: boolean }>(`/parties/${partyId}/members/me`, 'DELETE'),
};

// 예: 11월 20일 (목) 오후 7:00
export const formatMeetAt = (iso: string) => {
  const d = new Date(iso);
  const day = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];
  const hour = d.getHours();
  const minute = String(d.getMinutes()).padStart(2, '0');
  const ampm = hour < 12 ? '오전' : '오후';
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${day}) ${ampm} ${hour % 12 || 12}:${minute}`;
};
