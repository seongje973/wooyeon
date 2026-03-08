import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  // 💡 복잡한 useEffect, useState, Supabase 검사 로직을 다 뺐습니다.
  // 일단 화면부터 띄우고 봅시다!

  return (
    <SafeAreaProvider>
      <Stack>
        {/* 메인 탭 화면 */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

        {/* 로그인 화면 */}
        <Stack.Screen name="login" options={{ headerShown: false }} />

        {/* 학교 인증 화면 */}
        <Stack.Screen
          name="school-auth"
          options={{ title: '학교 인증', headerBackTitle: '뒤로' }}
        />

        {/* index는 이제 무조건 (tabs)로 보내주는 역할만 합니다 */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </SafeAreaProvider>
  );
}
