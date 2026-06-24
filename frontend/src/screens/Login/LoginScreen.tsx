import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import SocialButton from '@/components/SocialButton';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

// URL에서 access_token과 refresh_token을 안전하게 파싱하는 헬퍼 함수
const extractParamsFromUrl = (url: string) => {
  const params: { [key: string]: string } = {};
  
  // OAuth 인증 결과는 주로 해시(#) 기호 뒤에 토큰이 옵니다. (예: wooyeon://#access_token=xxx&refresh_token=yyy)
  // 쿼리(?) 기호 뒤에 올 수도 있으므로 양쪽 모두 대응합니다.
  const queryString = url.includes('#') ? url.split('#')[1] : url.split('?')[1];
  if (!queryString) return params;
  
  const pairs = queryString.split('&');
  for (const pair of pairs) {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  }
  return params;
};

const LoginScreen = () => {

  const handleSocialLogin = async (type: 'kakao' | 'google') => {
    console.log(`${type} 로그인 시도...`);

    try {
      // 1. 리다이렉트 URI 설정 (scheme을 명시하여 wooyeon:// 스키마 보장)
      const redirectUrl = makeRedirectUri({
        scheme: 'wooyeon',
      });
      console.log('생성된 리다이렉트 주소:', redirectUrl);

      // 2. Supabase OAuth 로그인 링크 요청
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: type,
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // 브라우저가 자동 이동하는 것을 방지하고 URL을 받음
        },
      });

      if (error) throw error;

      if (data?.url) {
        console.log('로그인 창 열기:', data.url);
        
        // 3. 인앱 브라우저로 OAuth 진행
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        // 4. 결과 처리
        if (result.type === 'success' && result.url) {
          console.log('브라우저 인증 성공, 결과 URL:', result.url);
          
          // 5. URL로부터 토큰 추출
          const params = extractParamsFromUrl(result.url);
          const { access_token, refresh_token } = params;

          if (access_token && refresh_token) {
            // 6. Supabase 세션 수동 저장
            const { error: sessionError } = await supabase.auth.setSession({
              access_token,
              refresh_token,
            });

            if (sessionError) throw sessionError;
            
            console.log('🎉 로그인 성공 및 세션 저장 완료!');
          } else {
            throw new Error('인증 결과 URL에서 토큰을 추출하지 못했습니다.');
          }
        } else if (result.type === 'cancel') {
          console.log('사용자가 로그인을 취소했습니다.');
        }
      }
    } catch (err) {
      console.error('로그인 에러:', err);
      Alert.alert('로그인 오류', (err as Error).message);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          3초 만에 시작하는{'\n'}
          설레는 우연
        </Text>
        <Text style={styles.subtitle}>
          간편하게 로그인하고{'\n'}
          우리 학교 친구들을 만나보세요.
        </Text>
      </View>

      <View style={styles.footer}>
        <SocialButton type="kakao" onPress={() => handleSocialLogin('kakao')} />
        <SocialButton type="google" onPress={() => handleSocialLogin('google')} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.white },
  header: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    lineHeight: 44,
  },
  subtitle: { fontSize: 16, color: Colors.gray600, lineHeight: 24 },
  footer: { padding: 24, paddingBottom: 60 },
});

export default LoginScreen;
