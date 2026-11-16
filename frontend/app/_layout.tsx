import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { ApiError } from '@/api/client';
import { profileApi } from '@/api/profile';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = session !== null;

  useEffect(() => {
    // 구독하면 저장된 세션으로 INITIAL_SESSION이 먼저 온다. 읽기에 실패해도 null로 온다.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setIsSessionLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // 저장된 세션을 다 읽기 전에 이동하면 로그인한 사용자도 로그인 화면으로 한 번 튕긴다.
    if (!isSessionLoaded) return;

    // 라우팅이 준비되었을 때 로그인 상태에 따라 리다이렉트 처리
    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // 로그인 안 했는데 인증 화면이 아니면 -> 로그인 화면으로 쫓아냄
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // 로그인 했는데 인증 화면에 있으면 -> 메인 탭으로 보냄
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isSessionLoaded, segments]);

  // 탭 화면에 들어올 때 프로필이 없으면 학교 인증 → 프로필 만들기로 보낸다.
  // 프로필을 저장하고 탭으로 돌아오면 다시 확인해야 해서, 프로필을 찾을 때까지 탭에 들어올 때마다 확인한다.
  const [hasProfile, setHasProfile] = useState(false);
  const userId = session?.user.id;
  useEffect(() => setHasProfile(false), [userId]);
  useEffect(() => {
    if (!userId || hasProfile || segments[0] !== '(tabs)') return;
    profileApi
      .getMine()
      .then(() => setHasProfile(true))
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) router.replace('/school-auth');
      });
  }, [userId, hasProfile, segments, router]);

  return (
    <SafeAreaProvider>
      <Stack>
        {/* 메인 탭 화면 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 로그인 화면 */}
        <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />

        {/* 학교 인증 화면 */}
        <Stack.Screen
          name="school-auth"
          options={{ title: '학교 인증', headerBackTitle: '뒤로' }}
        />
        <Stack.Screen name="profile-edit" options={{ title: '프로필', headerBackTitle: '뒤로' }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen name="party/[id]" options={{ title: '파티', headerBackTitle: '뒤로' }} />
        <Stack.Screen name="party-new" options={{ title: '파티 열기', headerBackTitle: '뒤로' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
