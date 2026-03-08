import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },

  // 헤더 (프로필 카드)
  header: {
    backgroundColor: 'white',
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 15,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15, backgroundColor: '#eee' },
  nickname: { fontSize: 22, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 14, color: '#888', marginTop: 5 },

  // 메뉴 리스트
  menuContainer: {
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 15,
    marginHorizontal: 15,
    padding: 5,
  },
  menuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuRowContent: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { marginRight: 10 },
  menuText: { fontSize: 16, color: '#333' },

  // 버튼
  logoutButton: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
  },
  logoutText: { color: '#ff4444', fontWeight: 'bold', fontSize: 16 },
});
