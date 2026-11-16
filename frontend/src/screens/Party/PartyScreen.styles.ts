import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
  },
  subtitle: {
    marginTop: 4,
    marginBottom: 16,
    fontSize: 14,
    color: Colors.gray600,
  },
  message: {
    marginBottom: 12,
    fontSize: 14,
    color: Colors.error,
  },
  emptyText: {
    marginTop: 40,
    fontSize: 15,
    color: Colors.gray600,
    textAlign: 'center',
  },
  card: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: 'bold',
    color: Colors.text,
  },
  badge: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
    fontSize: 12,
    color: Colors.white,
    backgroundColor: Colors.primary,
  },
  cardInfo: {
    marginTop: 2,
    fontSize: 14,
    color: Colors.gray800,
  },
  cardCount: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
});
