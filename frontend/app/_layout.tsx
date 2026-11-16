import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const isAuthenticated = session !== null;

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setIsSessionLoaded(true));
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
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

  return (
    <SafeAreaProvider>
      <Stack>
        {/* 메인 탭 화면 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 로그인 화면 */}
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />

        {/* 학교 인증 화면 */}
        <Stack.Screen
          name="school-auth"
          options={{ title: '학교 인증', headerBackTitle: '뒤로' }}
        />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="chat/[id]" options={{ presentation: 'card' }} />
      </Stack>
    </SafeAreaProvider>
  );
}
