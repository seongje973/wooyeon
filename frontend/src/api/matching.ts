import { request } from './client';

export interface Candidate {
  userId: string;
  nickname: string;
  age: number;
  bio: string;
  photoUrl: string | null;
  universityName: string;
  distanceKm: number;
}

export interface Match {
  matchId: string;
  matchedAt: string;
  user: Pick<Candidate, 'userId' | 'nickname' | 'age' | 'photoUrl' | 'universityName'>;
}

export const matchingApi = {
  candidates: () => request<Candidate[]>('/matching/candidates'),

  swipe: (targetUserId: string, liked: boolean) =>
    request<{ matched: boolean; matchId?: string }>('/matching/swipes', 'POST', { targetUserId, liked }),

  matches: () => request<Match[]>('/matching/matches'),
};
