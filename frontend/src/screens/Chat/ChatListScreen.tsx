import React, { useCallback, useState } from 'react';
import { FlatList, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ChatRoom, chatApi } from '@/api/chat';
import type { Match } from '@/api/matching';
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

  const openRoom = (room: Match) =>
    router.push({
      pathname: '/chat/[id]',
      params: { id: room.matchId, name: room.user.nickname, userId: room.user.userId },
    });
  // 아직 대화가 없는 매칭은 위쪽 가로줄에, 대화가 오간 방은 아래 목록에 둔다.
  const newMatches = rooms.filter((room) => !room.lastMessage);
  const talking = rooms.filter((room) => room.lastMessage);

  if (rooms.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIcon}>
          <Ionicons name="chatbubbles-outline" size={40} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>아직 대화가 없어요</Text>
        <Text style={styles.emptyText}>{message || '매칭에서 서로 좋아요가 되면 여기서 대화할 수 있어요'}</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={talking}
      keyExtractor={(room) => room.matchId}
      ListHeaderComponent={
        <>
          {message !== '' && <Text style={styles.message}>{message}</Text>}
          {newMatches.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>새로운 매칭</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.newList}
              >
                {newMatches.map((room) => (
                  <TouchableOpacity
                    key={room.matchId}
                    style={styles.newItem}
                    onPress={() => openRoom(room)}
                  >
                    {room.user.photoUrl ? (
                      <Image source={{ uri: room.user.photoUrl }} style={styles.newPhoto} />
                    ) : (
                      <View style={styles.newPhoto}>
                        <Ionicons name="person" size={32} color={Colors.gray400} />
                      </View>
                    )}
                    <Text style={styles.newName} numberOfLines={1}>
                      {room.user.nickname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}
          {talking.length > 0 && <Text style={styles.sectionTitle}>메시지</Text>}
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.row} onPress={() => openRoom(item)}>
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
              {item.lastMessage?.body}
            </Text>
          </View>
        </TouchableOpacity>
      )}
    />
  );
}
