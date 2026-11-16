import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { Colors } from '@/constants/Colors';

export default function Wordmark({ color = Colors.primary, size = 26 }: { color?: string; size?: number }) {
  return <Text style={[styles.text, { color, fontSize: size }]}>우연</Text>;
}

const styles = StyleSheet.create({
  text: {
    fontWeight: '900',
    letterSpacing: -1,
  },
});
