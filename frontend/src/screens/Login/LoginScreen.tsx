import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/Colors';
import SocialButton from '@/components/SocialButton';
import { supabase } from '@/lib/supabase';
import * as Linking from 'expo-linking';

const LoginScreen = () => {
  const router = useRouter();

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        console.log('✅ 로그인 감지됨! 메인으로 이동합니다.');
        router.replace('/(tabs)');
      }
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSocialLogin = async (type: 'kakao' | 'google') => {
    console.log(`${type} 로그인 시도...`);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: type,
        options: {
          redirectTo: Linking.createURL('/'),
          queryParams: {
            scope: 'profile_nickname,profile_image',
          },
        },
      });

      if (error) throw error;

      if (data.url) {
        console.log('로그인 창 열기:', data.url);
        await Linking.openURL(data.url);
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
