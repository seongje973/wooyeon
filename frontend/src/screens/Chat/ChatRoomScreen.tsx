import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Message, chatApi } from '@/api/chat';
import { styles } from './ChatRoomScreen.styles';

const POLL_MS = 3000;

// 보낸 메시지와 폴링으로 받은 메시지가 겹칠 수 있어 id로 합친다.
const merge = (prev: Message[], incoming: Message[]) => {
  const ids = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !ids.has(m.id));
  return added.length ? [...prev, ...added].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : prev;
};

export default function ChatRoomScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const [myId, setMyId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const lastAt = useRef<string | undefined>(undefined);
  const listRef = useRef<FlatList<Message>>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setMyId(data.session?.user.id ?? null));
  }, []);

  useEffect(() => {
    lastAt.current = messages[messages.length - 1]?.createdAt;
  }, [messages]);

  useEffect(() => {
    let active = true;
    const poll = () =>
      chatApi
        .messages(id, lastAt.current)
        .then((list) => {
          if (!active) return;
          setMessages((prev) => merge(prev, list));
          setError('');
        })
        .catch((err) => active && setError((err as Error).message));
    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [id]);

  const send = async () => {
    const body = text.trim();
    if (!body) return;
    setText('');
    try {
      const sent = await chatApi.send(id, body);
      setMessages((prev) => merge(prev, [sent]));
    } catch (err) {
      setText(body);
      setError((err as Error).message);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Stack.Screen options={{ title: name ?? '채팅', headerBackTitle: '뒤로' }} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={styles.list}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            const mine = item.senderId === myId;
            return (
              <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
                <Text style={mine ? styles.mineText : styles.theirsText}>{item.body}</Text>
              </View>
            );
          }}
        />
        {error !== '' && <Text style={styles.error}>{error}</Text>}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="메시지 보내기"
            placeholderTextColor={Colors.gray400}
            value={text}
            onChangeText={setText}
            onSubmitEditing={send}
            maxLength={1000}
          />
          <TouchableOpacity onPress={send} disabled={!text.trim()} accessibilityLabel="보내기">
            <Ionicons name="send" size={24} color={text.trim() ? Colors.primary : Colors.gray400} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
