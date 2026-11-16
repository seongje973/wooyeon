import { supabase } from '../supabase.js';

// 내가 차단했거나 나를 차단한 사람. 후보·매칭·채팅 어디에서도 서로 보이지 않게 한다.
export const blockedUserIds = async (userId: string): Promise<Set<string>> => {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocker, blocked')
    .or(`blocker.eq.${userId},blocked.eq.${userId}`);
  if (error) throw error;
  return new Set((data ?? []).map((b) => (b.blocker === userId ? b.blocked : b.blocker)));
};
