import { supabase } from '@/lib/supabase';
import { request } from './client';

export type Gender = 'male' | 'female';

export interface Profile {
  userId: string;
  nickname: string;
  birthYear: number;
  gender: Gender;
  bio: string;
  photoPath: string | null;
  photoUrl: string | null;
  universityId: string;
  radiusKm: number;
}

export type ProfileInput = Pick<Profile, 'nickname' | 'birthYear' | 'gender' | 'bio' | 'photoPath' | 'radiusKm'>;

export const RADIUS_OPTIONS = [5, 10, 20];

export const profileApi = {
  getMine: () => request<Profile>('/profile/me'),

  save: (input: ProfileInput) => request<Profile>('/profile/me', 'PUT', input),

  // 사진은 서버를 거치지 않고 로그인한 사용자로 Storage의 내 폴더에 올리고, 경로만 서버에 저장한다.
  uploadPhoto: async (uri: string, mimeType = 'image/jpeg') => {
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user.id;
    if (!userId) throw new Error('로그인이 필요해요.');
    const path = `${userId}/${Date.now()}.${mimeType.split('/')[1] ?? 'jpg'}`;
    // React Native에서는 Blob 업로드가 빈 파일이 될 수 있어 ArrayBuffer로 보낸다.
    const body = await (await fetch(uri)).arrayBuffer();
    const { error } = await supabase.storage.from('profile-photos').upload(path, body, { contentType: mimeType });
    if (error) throw error;
    return path;
  },
};
