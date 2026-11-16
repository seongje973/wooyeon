import React, { useCallback, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { profileApi, type Profile } from '@/api/profile';
import { safetyApi } from '@/api/safety';
import { Universities } from '@/constants/Universities';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { styles } from './MyPageScreen.styles';

export default function MyPageScreen() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const schoolName = Universities.find((u) => u.id === profile?.universityId)?.name;

  // 프로필 수정 화면에서 돌아왔을 때 바뀐 내용을 다시 받는다.
  useFocusEffect(
    useCallback(() => {
      profileApi
        .getMine()
        .then(setProfile)
        .catch((error) => console.log('프로필 로딩 실패:', error));
    }, [])
  );

  const handleLogout = async () => {
    // 웹에서는 Alert.alert가 아무것도 띄우지 않아서 브라우저 확인 창을 쓴다.
    if (Platform.OS === 'web') {
      if (!window.confirm('정말 로그아웃 하시겠습니까?')) return;
      await supabase.auth.signOut();
      router.replace('/login');
      return;
    }
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

  const handleDeleteAccount = async () => {
    setDeleteError('');
    try {
      await safetyApi.deleteAccount();
      // 서버에서 계정이 지워져도 기기에 남은 세션은 직접 지워야 한다.
      await supabase.auth.signOut({ scope: 'local' });
      router.replace('/login');
    } catch (error) {
      setDeleteError((error as Error).message);
    }
  };

  // 3. 로그인 하러 가기 (로그인 안 된 상태일 때)
  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <ScrollView style={styles.container}>
      {/* --- 프로필 카드 영역 --- */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/profile-edit')} disabled={!profile}>
          {profile?.photoUrl ? (
            <Image source={{ uri: profile.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={56} color={Colors.gray400} />
            </View>
          )}
          {profile && (
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={16} color={Colors.white} />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.nickname}>
          {profile ? profile.nickname : '로그인이 필요해요'}
        </Text>
        <View style={styles.schoolRow}>
          {profile && <Ionicons name="school" size={14} color={Colors.primary} />}
          <Text style={styles.email}>{profile ? schoolName : '게스트 모드입니다'}</Text>
        </View>
      </View>

      {/* --- 메뉴 리스트 --- */}
      <View style={styles.menuContainer}>
        <MenuRow
          icon="person-outline"
          title="프로필 수정"
          onPress={() => router.push('/profile-edit')}
        />
        <MenuRow
          icon="school-outline"
          title="학교 인증하기"
          onPress={() => router.push('/school-auth')}
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
        <TouchableOpacity style={[styles.logoutButton, styles.loginButton]} onPress={handleLogin}>
          <Text style={[styles.logoutText, styles.loginText]}>로그인 하러가기</Text>
        </TouchableOpacity>
      )}

      {profile && (
        <View style={styles.deleteArea}>
          {confirmDelete ? (
            <>
              <Text style={styles.deleteNotice}>
                탈퇴하면 프로필·사진·매칭·대화가 모두 지워지고 되돌릴 수 없어요.
              </Text>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
                <Text style={styles.deleteButtonText}>탈퇴하기</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setConfirmDelete(false)}>
                <Text style={styles.deleteLink}>취소</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity onPress={() => setConfirmDelete(true)}>
              <Text style={styles.deleteLink}>회원 탈퇴</Text>
            </TouchableOpacity>
          )}
          {deleteError !== '' && <Text style={styles.deleteNotice}>{deleteError}</Text>}
        </View>
      )}

      <View style={{ height: 50 }} />
    </ScrollView>
  );
}

// 메뉴 한 줄 부품
const MenuRow = ({ icon, title, onPress }: any) => (
  <TouchableOpacity style={styles.menuRow} onPress={onPress}>
    <View style={styles.menuRowContent}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={Colors.primary} />
      </View>
      <Text style={styles.menuText}>{title}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={Colors.gray400} />
  </TouchableOpacity>
);
