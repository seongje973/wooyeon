import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function PartyScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>다대다 파티 🍻</Text>
      <Text>우리 학교 연합 미팅/모임 리스트</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});
