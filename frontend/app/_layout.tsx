import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function RootLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();
  const rootNavigationState = useRootNavigationState();
  const segments = useSegments();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('초기 세션 확인:', !!session);
      setIsAuthenticated(!!session);
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('인증 이벤트 발생:', event, '세션 존재:', !!session);
      setIsAuthenticated(!!session);
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);


  useEffect(() => {
    if(!rootNavigationState?.key || isAuthenticated === null) return;
    const inAuthGroup = segments[0] === '(auth)';
    console.log('현재 세그먼트:', segments);
    console.log('인증상태:', isAuthenticated, '인증그룹여부:', inAuthGroup);
    const routingTimer = setTimeout(() => {
      if (!isAuthenticated && !inAuthGroup) {
        console.log('👉 로그인 화면으로 이동');
        router.replace('/(auth)/login' as any);
      } else if (isAuthenticated && inAuthGroup) {
        console.log('🚀 메인 탭으로 이동 시도');
        router.replace('/(tabs)' as any);
      }
    }, 0);

    return () => clearTimeout(routingTimer);
  }, [isAuthenticated, segments, rootNavigationState?.key]);

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
