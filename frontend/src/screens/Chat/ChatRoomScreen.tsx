import React, { useEffect, useRef, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { supabase } from '@/lib/supabase';
import { Message, chatApi } from '@/api/chat';
import { safetyApi } from '@/api/safety';
import { styles } from './ChatRoomScreen.styles';

const POLL_MS = 3000;
const REPORT_REASONS = ['불쾌한 말이나 욕설', '사진·정보 도용 의심', '광고·스팸', '기타'];

// 보낸 메시지와 폴링으로 받은 메시지가 겹칠 수 있어 id로 합친다.
const merge = (prev: Message[], incoming: Message[]) => {
  const ids = new Set(prev.map((m) => m.id));
  const added = incoming.filter((m) => !ids.has(m.id));
  return added.length ? [...prev, ...added].sort((a, b) => a.createdAt.localeCompare(b.createdAt)) : prev;
};

export default function ChatRoomScreen() {
  const router = useRouter();
  const { id, name, userId } = useLocalSearchParams<{ id: string; name?: string; userId?: string }>();
  const [menuOpen, setMenuOpen] = useState(false);
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
      <Stack.Screen
        options={{
          title: name ?? '채팅',
          headerBackTitle: '뒤로',
          headerRight: () =>
            userId ? (
              <TouchableOpacity onPress={() => setMenuOpen((open) => !open)} accessibilityLabel="신고·차단">
                <Ionicons name="ellipsis-horizontal" size={22} color={Colors.text} />
              </TouchableOpacity>
            ) : null,
        }}
      />
      {menuOpen && userId && (
        <SafetyPanel userId={userId} name={name ?? '상대'} onBlocked={() => router.back()} onClose={() => setMenuOpen(false)} />
      )}
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

// 웹에서는 Alert가 뜨지 않아서 확인 단계도 화면 안에서 보여 준다.
function SafetyPanel({
  userId,
  name,
  onBlocked,
  onClose,
}: {
  userId: string;
  name: string;
  onBlocked: () => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState<'menu' | 'report' | 'block'>('menu');
  const [reason, setReason] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  const run = async (action: () => Promise<unknown>, done: string) => {
    setNotice('');
    try {
      await action();
      setNotice(done);
      return true;
    } catch (err) {
      setNotice((err as Error).message);
      return false;
    }
  };

  return (
    <View style={styles.panel}>
      {step === 'menu' && (
        <>
          <TouchableOpacity style={styles.panelRow} onPress={() => setStep('report')}>
            <Text style={styles.panelText}>신고하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.panelRow} onPress={() => setStep('block')}>
            <Text style={styles.panelDanger}>차단하기</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 'report' && (
        <>
          <Text style={styles.panelTitle}>신고 사유를 골라 주세요</Text>
          <View style={styles.reasons}>
            {REPORT_REASONS.map((r) => (
              <TouchableOpacity key={r} style={[styles.reason, reason === r && styles.reasonSelected]} onPress={() => setReason(r)}>
                <Text style={reason === r ? styles.reasonTextSelected : styles.reasonText}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            style={styles.panelButton}
            disabled={!reason}
            onPress={() => reason && run(() => safetyApi.report(userId, reason), '신고가 접수됐어요. 확인 후 조치할게요.')}
          >
            <Text style={styles.panelButtonText}>신고 보내기</Text>
          </TouchableOpacity>
        </>
      )}
      {step === 'block' && (
        <>
          <Text style={styles.panelTitle}>{name}님을 차단할까요?</Text>
          <Text style={styles.panelText}>차단하면 서로 추천되지 않고 이 대화도 볼 수 없어요.</Text>
          <TouchableOpacity
            style={[styles.panelButton, styles.panelButtonDanger]}
            onPress={async () => {
              if (await run(() => safetyApi.block(userId), '')) onBlocked();
            }}
          >
            <Text style={styles.panelButtonText}>차단하기</Text>
          </TouchableOpacity>
        </>
      )}
      {notice !== '' && <Text style={styles.panelNotice}>{notice}</Text>}
      <TouchableOpacity style={styles.panelRow} onPress={onClose}>
        <Text style={styles.panelCancel}>닫기</Text>
      </TouchableOpacity>
    </View>
  );
}
