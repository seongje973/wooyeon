import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  list: {
    padding: 16,
    gap: 8,
  },
  bubble: {
    maxWidth: '75%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  mine: {
    alignSelf: 'flex-end',
    backgroundColor: Colors.primary,
  },
  theirs: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.gray100,
  },
  mineText: {
    fontSize: 15,
    color: Colors.white,
  },
  theirsText: {
    fontSize: 15,
    color: Colors.text,
  },
  error: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    fontSize: 13,
    color: Colors.error,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
  },
  input: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: Colors.gray100,
    fontSize: 15,
    color: Colors.text,
  },
});
