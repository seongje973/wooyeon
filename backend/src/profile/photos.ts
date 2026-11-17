import { supabase } from '../supabase.js';

export const PHOTO_BUCKET = 'profile-photos';

// 사용자 폴더(<user_id>/)의 사진을 지운다. keepPath를 주면 그 파일만 남긴다.
export const removePhotos = async (userId: string, keepPath?: string | null) => {
  // list는 한 번에 100개까지만 주므로 지울 것이 없을 때까지 되풀이한다.
  for (;;) {
    const { data: files, error: listError } = await supabase.storage.from(PHOTO_BUCKET).list(userId);
    if (listError) throw listError;
    const paths = (files ?? []).map((f) => `${userId}/${f.name}`).filter((path) => path !== keepPath);
    if (!paths.length) return;
    const { error: removeError } = await supabase.storage.from(PHOTO_BUCKET).remove(paths);
    if (removeError) throw removeError;
  }
};
