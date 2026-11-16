import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  info: {
    fontSize: 15,
    color: Colors.gray800,
    marginBottom: 4,
  },
  description: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
    fontSize: 15,
    color: Colors.gray800,
    backgroundColor: Colors.gray100,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  member: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.gray100,
  },
  memberName: {
    marginLeft: 12,
    fontSize: 15,
    color: Colors.text,
  },
  host: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  memberSchool: {
    marginLeft: 8,
    fontSize: 13,
    color: Colors.gray600,
  },
  message: {
    marginTop: 16,
    fontSize: 14,
    color: Colors.error,
  },
  action: {
    marginTop: 24,
  },
});
