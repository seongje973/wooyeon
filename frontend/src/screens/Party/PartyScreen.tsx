import React, { useCallback, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { PartySummary, formatMeetAt, partyApi } from '@/api/party';
import { styles } from './PartyScreen.styles';

export default function PartyScreen() {
  const router = useRouter();
  const [parties, setParties] = useState<PartySummary[]>([]);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      partyApi
        .list()
        .then((list) => {
          setParties(list);
          setMessage('');
        })
        .catch((err) => setMessage((err as Error).message));
    }, []),
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={parties}
        keyExtractor={(party) => party.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>다대다 파티 🍻</Text>
            <Text style={styles.subtitle}>가까운 학교에서 열리는 미팅에 참여해 보세요</Text>
            {message !== '' && <Text style={styles.message}>{message}</Text>}
          </>
        }
        ListEmptyComponent={
          message === '' ? (
            <Text style={styles.emptyText}>아직 열린 파티가 없어요. 첫 파티를 열어 보세요!</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push({ pathname: '/party/[id]', params: { id: item.id } })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title}
              </Text>
              {item.joined && (
                <Text style={styles.badge}>{item.isHost ? '내가 연 파티' : '참여 중'}</Text>
              )}
            </View>
            <Text style={styles.cardInfo}>
              {formatMeetAt(item.meetAt)} · {item.place}
            </Text>
            <Text style={styles.cardInfo}>
              {item.universityName} · {item.distanceKm}km
            </Text>
            <Text style={styles.cardCount}>
              {item.size}:{item.size} · 남 {item.maleCount}/{item.size} · 여 {item.femaleCount}/
              {item.size}
            </Text>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/party-new')}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </TouchableOpacity>
    </View>
  );
}
