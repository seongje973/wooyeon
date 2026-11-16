import { supabase } from '@/lib/supabase';

// 우연 API 서버 주소 (backend/). 공개돼도 되는 값이라 EXPO_PUBLIC_으로 둔다.
const API_URL = process.env.EXPO_PUBLIC_API_URL ?? '';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const request = async <T>(path: string, method = 'GET', body?: unknown): Promise<T> => {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.session?.access_token ?? ''}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(res.status, json?.message ?? '잠시 후 다시 시도해 주세요.');
  return json as T;
};
