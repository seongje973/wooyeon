import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';
import { Radius } from '@/constants/GlobalStyle';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  newList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  newItem: {
    width: 84,
    alignItems: 'center',
  },
  newPhoto: {
    width: 84,
    height: 112,
    borderRadius: 14,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newName: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Radius.pill,
    backgroundColor: Colors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    marginLeft: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray100,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  school: {
    fontSize: 13,
    fontWeight: 'normal',
    color: Colors.gray600,
  },
  preview: {
    marginTop: 4,
    fontSize: 14,
    color: Colors.gray600,
  },
  message: {
    padding: 16,
    fontSize: 14,
    color: Colors.error,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  emptyIcon: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primarySoft,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.gray600,
    textAlign: 'center',
  },
});
