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
  panel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
    backgroundColor: Colors.white,
  },
  panelRow: {
    paddingVertical: 12,
  },
  panelTitle: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
  },
  panelText: {
    fontSize: 15,
    color: Colors.text,
  },
  panelDanger: {
    fontSize: 15,
    color: Colors.error,
  },
  panelCancel: {
    fontSize: 15,
    color: Colors.gray600,
  },
  panelNotice: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.gray800,
  },
  reasons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  reason: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.gray400,
  },
  reasonSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  reasonText: {
    fontSize: 14,
    color: Colors.gray800,
  },
  reasonTextSelected: {
    fontSize: 14,
    color: Colors.white,
  },
  panelButton: {
    marginTop: 12,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
  },
  panelButtonDanger: {
    backgroundColor: Colors.error,
  },
  panelButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.white,
  },
});
