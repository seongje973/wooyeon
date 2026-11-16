import React, { useCallback, useState } from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ChatRoom, chatApi } from '@/api/chat';
import { styles } from './ChatListScreen.styles';

export default function ChatListScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      chatApi
        .rooms()
        .then((list) => {
          setRooms(list);
          setMessage('');
        })
        .catch((err) => setMessage((err as Error).message));
    }, [])
  );

  if (rooms.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
        <Text style={styles.emptyText}>{message || '매칭에서 서로 좋아요가 되면 여기서 대화할 수 있어요'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={rooms}
      keyExtractor={(room) => room.matchId}
      ListHeaderComponent={message !== '' ? <Text style={styles.message}>{message}</Text> : null}
      renderItem={({ item }) => (
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push({ pathname: '/chat/[id]', params: { id: item.matchId, name: item.user.nickname } })}
        >
          {item.user.photoUrl ? (
            <Image source={{ uri: item.user.photoUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={Colors.gray400} />
            </View>
          )}
          <View style={styles.rowText}>
            <Text style={styles.name}>
              {item.user.nickname} <Text style={styles.school}>{item.user.universityName}</Text>
            </Text>
            <Text style={styles.preview} numberOfLines={1}>
              {item.lastMessage?.body ?? '새로운 인연이에요. 먼저 인사해 보세요!'}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
