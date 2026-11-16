import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radius, Shadow } from '@/constants/GlobalStyle';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.gray100 },

  // 헤더 (프로필 카드)
  header: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 28,
    marginBottom: 16,
    borderBottomLeftRadius: Radius.card,
    borderBottomRightRadius: Radius.card,
    ...Shadow.card,
  },
  avatar: {
    width: 112,
    height: 112,
    borderRadius: 56,
    marginBottom: 14,
    backgroundColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadge: {
    position: 'absolute',
    right: 0,
    bottom: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderWidth: 3,
    borderColor: Colors.white,
  },
  nickname: { fontSize: 24, fontWeight: '800', color: Colors.text },
  schoolRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 6 },
  email: { fontSize: 14, color: Colors.gray600 },

  // 메뉴 리스트
  menuContainer: {
    backgroundColor: Colors.white,
    marginBottom: 20,
    borderRadius: 20,
    marginHorizontal: 16,
    paddingHorizontal: 4,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  menuRowContent: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
  },
  menuText: { fontSize: 16, color: Colors.text },

  // 버튼
  logoutButton: {
    marginHorizontal: 16,
    padding: 15,
    borderRadius: Radius.button,
    backgroundColor: Colors.white,
    alignItems: 'center',
  },
  logoutText: { color: Colors.error, fontWeight: 'bold', fontSize: 16 },
  loginButton: { backgroundColor: Colors.primary },
  loginText: { color: Colors.white },

  // 회원 탈퇴
  deleteArea: { alignItems: 'center', marginTop: 24, marginHorizontal: 20 },
  deleteLink: { fontSize: 14, color: Colors.gray600, textDecorationLine: 'underline', padding: 8 },
  deleteNotice: { fontSize: 14, color: Colors.gray800, textAlign: 'center', marginBottom: 12 },
  deleteButton: {
    alignSelf: 'stretch',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    backgroundColor: Colors.error,
  },
  deleteButtonText: { color: Colors.white, fontWeight: 'bold', fontSize: 16 },
});
