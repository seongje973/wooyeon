import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },

  // 헤더 영역
  header: {
    padding: 20,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: { fontSize: 16, color: '#666', marginBottom: 5 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  highlight: { color: '#ff7f00' },
  bellButton: { padding: 10, backgroundColor: '#f5f5f5', borderRadius: 20 },

  // 카드 리스트 영역
  cardList: { paddingHorizontal: 20, paddingBottom: 20 },
  card: {
    width: width * 0.4,
    height: 200,
    borderRadius: 20,
    padding: 15,
    marginRight: 15,
    justifyContent: 'flex-end',
  },
  cardImagePlaceholder: { position: 'absolute', top: 20, left: 0, right: 0, alignItems: 'center' },
  cardName: { fontSize: 18, fontWeight: 'bold', marginBottom: 5 },
  cardMajor: { fontSize: 14, color: '#666', marginBottom: 5 },
  cardTag: { fontSize: 12, color: '#ff7f00', fontWeight: 'bold' },

  // 게시판 영역
  sectionHeader: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  moreText: { color: '#999' },

  boardContainer: { paddingHorizontal: 20 },
  boardItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  boardTitle: { fontSize: 16, marginBottom: 5 },
  boardTime: { fontSize: 12, color: '#999' },
  likeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0e6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  likeCount: { fontSize: 12, color: '#ff7f00', marginLeft: 4, fontWeight: 'bold' },

  // 여백
  footerSpace: { height: 100 },
});
