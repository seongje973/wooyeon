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
  photo: {
    alignSelf: 'center',
    width: 120,
    height: 160,
    borderRadius: 16,
    backgroundColor: Colors.gray100,
    borderWidth: 1,
    borderColor: Colors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 24,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray400,
  },
  chipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: 15,
    color: Colors.gray800,
  },
  chipTextSelected: {
    color: Colors.white,
    fontWeight: '600',
  },
  bio: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    textAlignVertical: 'top',
    marginBottom: 24,
  },
  message: {
    fontSize: 14,
    color: Colors.error,
    marginBottom: 12,
  },
});
