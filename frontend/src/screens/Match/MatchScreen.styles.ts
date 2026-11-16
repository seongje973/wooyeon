import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  deck: {
    flex: 1,
    margin: 16,
  },
  cardLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  card: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
    overflow: 'hidden',
  },
  photo: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray200,
  },
  info: {
    padding: 20,
    backgroundColor: Colors.white,
  },
  name: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
  },
  age: {
    fontSize: 22,
    fontWeight: 'normal',
    color: Colors.gray800,
  },
  school: {
    marginTop: 6,
    fontSize: 15,
    color: Colors.gray800,
  },
  distance: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.primary,
  },
  tags: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.primaryDark,
  },
  stamp: {
    position: 'absolute',
    top: 32,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 3,
    borderRadius: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  likeStamp: {
    left: 24,
    color: Colors.love,
    borderColor: Colors.love,
    transform: [{ rotate: '-15deg' }],
  },
  passStamp: {
    right: 24,
    color: Colors.gray600,
    borderColor: Colors.gray600,
    transform: [{ rotate: '15deg' }],
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 24,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
    padding: 24,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.gray600,
  },
});
