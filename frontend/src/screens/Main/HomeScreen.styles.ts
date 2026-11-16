import { StyleSheet, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radius, Shadow } from '@/constants/GlobalStyle';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  // 헤더 영역
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { paddingHorizontal: 20, fontSize: 24, fontWeight: '800', color: Colors.text },
  greeting: {
    paddingHorizontal: 20,
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.gray600,
  },
  bellButton: { padding: 10, backgroundColor: Colors.gray100, borderRadius: Radius.pill },

  // 카드 리스트 영역
  cardList: { paddingHorizontal: 20, paddingBottom: 20, gap: 12 },
  card: {
    width: width * 0.42,
    height: 240,
    borderRadius: 20,
    padding: 14,
    justifyContent: 'flex-end',
  },
  cardImagePlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: { fontSize: 18, fontWeight: '800', color: Colors.white },
  cardMajor: { marginTop: 2, fontSize: 13, color: Colors.white },
  cardTag: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    overflow: 'hidden',
    backgroundColor: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  profileCard: { backgroundColor: Colors.gray200, overflow: 'hidden', ...Shadow.card },
  cardPhoto: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  emptyCard: { backgroundColor: Colors.gray100, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 14, color: Colors.gray600, textAlign: 'center' },

  // 새로운 인연
  matchList: { paddingHorizontal: 20, gap: 14 },
  matchItem: { alignItems: 'center', width: 72 },
  matchRing: { padding: 3, borderRadius: Radius.pill, borderWidth: 2, borderColor: Colors.primary },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  matchName: { marginTop: 6, fontSize: 13, fontWeight: '600', color: Colors.text },

  // 게시판 영역
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 19, fontWeight: '800', color: Colors.text },
  moreText: { fontSize: 13, color: Colors.gray600 },

  boardContainer: { paddingHorizontal: 20 },
  boardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  boardTitle: { fontSize: 16, marginBottom: 5, color: Colors.text },
  boardTime: { fontSize: 12, color: Colors.gray600 },
  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primarySoft,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  likeCount: { fontSize: 12, color: Colors.love, marginLeft: 4, fontWeight: 'bold' },

  // 여백
  footerSpace: { height: 100 },
});
