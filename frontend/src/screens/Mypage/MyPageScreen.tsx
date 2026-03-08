import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './MyPageScreen.styles';

export default function MyPageScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setProfile(user.user_metadata);
      }
    } catch (error) {
      console.log('프로필 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert('로그아웃', '정말 로그아웃 하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '로그아웃',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/login');
        },
      },
    ]);
  };

  // 3. 로그인 하러 가기 (로그인 안 된 상태일 때)
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* --- 프로필 카드 영역 --- */}
      <View style={styles.header}>
        <Image
          source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
          style={styles.avatar}
        />
        <Text style={styles.nickname}>
          {profile ? profile.full_name || profile.name : '로그인이 필요해요'}
        </Text>
        <Text style={styles.email}>{profile ? profile.email : '게스트 모드입니다'}</Text>
      </View>

      {/* --- 메뉴 리스트 --- */}
      <View style={styles.menuContainer}>
        <MenuRow
          icon="school-outline"
          title="학교 인증하기"
          onPress={() => console.log('학교인증')}
        />
        <MenuRow icon="settings-outline" title="설정" onPress={() => console.log('설정')} />
        <MenuRow
          icon="document-text-outline"
          title="이용약관"
          onPress={() => console.log('약관')}
        />
      </View>

      {/* --- 버튼 영역 (로그인 상태에 따라 다르게 보임) --- */}
      {profile ? (
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#ff7f00' }]}
          onPress={handleLogin}
        >
          <Text style={[styles.logoutText, { color: 'white' }]}>로그인 하러가기</Text>
        </TouchableOpacity>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// 메뉴 한 줄 부품
const MenuRow = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
    <View style={styles.menuRowContent}>
      <Ionicons name={icon} size={24} color="#333" style={styles.menuIcon} />
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);
