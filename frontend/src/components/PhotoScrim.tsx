import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Colors } from '@/constants/Colors';

// 그라데이션 패키지 없이 아래로 갈수록 진해지는 층을 띠 여러 개로 흉내 낸다.
const BANDS = Array.from({ length: 32 }, (_, i) => 0.65 * Math.pow(i / 31, 1.6));

export default function PhotoScrim({ height = '55%' }: { height?: `${number}%` }) {
  return (
    <View pointerEvents="none" style={[styles.scrim, { height }]}>
      {BANDS.map((opacity, i) => (
        <View key={i} style={[styles.band, { opacity }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  band: {
    flex: 1,
    backgroundColor: Colors.scrim,
  },
});
