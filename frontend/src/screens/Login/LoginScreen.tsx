import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';
import SocialButton from '@/components/SocialButton';
import { supabase } from '@/lib/supabase';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

const LoginScreen = () => {

  const handleSocialLogin = async (type: 'kakao' | 'google') => {
    console.log(`${type} 로그인 시도...`);

    try {
      const redirectUrl = makeRedirectUri();
      console.log('생성된 리다이렉트 주소:', redirectUrl);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: type,
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) throw error;

      if (data.url) {
        console.log('로그인 창 열기:', data.url);
        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

        if (result.type === 'success') {
          const { data: { session } } = await supabase.auth.getSession();
          if (session) {
             console.log('로그인 성공! 레이아웃이 화면을 전환합니다.');
          }
        }
      }
    } catch (err) {
      console.error(err);
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
