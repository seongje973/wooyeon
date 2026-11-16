import React, { useCallback, useState } from 'react';
import { Alert, Image, Platform, ScrollView, Text, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import CommonButton from '@/components/CommonButton';
import { Colors } from '@/constants/Colors';
import { PartyDetail, PartyMember, formatMeetAt, partyApi } from '@/api/party';
import { styles } from './PartyDetailScreen.styles';

// 웹에서는 Alert.alert가 아무것도 띄우지 않아서 브라우저 확인 창을 쓴다.
const confirm = (title: string, body: string, onOk: () => void) => {
  if (Platform.OS === 'web') {
    if (window.confirm(`${title}\n${body}`)) onOk();
    return;
  }
  Alert.alert(title, body, [
    { text: '취소', style: 'cancel' },
    { text: '확인', style: 'destructive', onPress: onOk },
  ]);
};

function MemberRow({ member }: { member: PartyMember }) {
  return (
    <View style={styles.member}>
      {member.photoUrl ? (
        <Image source={{ uri: member.photoUrl }} style={styles.avatar} />
      ) : (
        <View style={styles.avatar}>
          <Ionicons name="person" size={22} color={Colors.gray400} />
        </View>
      )}
      <Text style={styles.memberName}>
        {member.nickname}, {member.age}
        {member.isHost && <Text style={styles.host}> 방장</Text>}
      </Text>
      <Text style={styles.memberSchool}>{member.universityName}</Text>
    </View>
  );
}

export default function PartyDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [party, setParty] = useState<PartyDetail | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      partyApi
        .detail(id)
        .then(setParty)
        .catch((err) => setMessage((err as Error).message));
    }, [id]),
  );

  const run = async (action: () => Promise<void>) => {
    setIsBusy(true);
    setMessage('');
    try {
      await action();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleJoin = () => run(async () => setParty(await partyApi.join(id)));

  const handleLeave = () =>
    confirm(
      party?.isHost ? '파티 닫기' : '파티 나가기',
      party?.isHost ? '방장이 나가면 파티가 사라져요.' : '이 파티에서 나갈까요?',
      () =>
        run(async () => {
          await partyApi.leave(id);
          if (router.canGoBack()) router.back();
          else router.replace('/party');
        }),
    );

  if (!party) {
    return (
      <View style={styles.empty}>
        <Text style={styles.message}>{message || '불러오는 중이에요'}</Text>
      </View>
    );
  }

  const males = party.members.filter((m) => m.gender === 'male');
  const females = party.members.filter((m) => m.gender === 'female');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: party.title }} />
      <Text style={styles.title}>{party.title}</Text>
      <Text style={styles.info}>🕖 {formatMeetAt(party.meetAt)}</Text>
      <Text style={styles.info}>📍 {party.place}</Text>
      <Text style={styles.info}>
        🏫 {party.universityName} · {party.distanceKm}km
      </Text>
      {party.description !== '' && <Text style={styles.description}>{party.description}</Text>}

      <Text style={styles.section}>
        남자 {males.length}/{party.size}
      </Text>
      {males.map((m) => (
        <MemberRow key={m.userId} member={m} />
      ))}
      <Text style={styles.section}>
        여자 {females.length}/{party.size}
      </Text>
      {females.map((m) => (
        <MemberRow key={m.userId} member={m} />
      ))}

      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <View style={styles.action}>
        {party.joined ? (
          <CommonButton
            title={party.isHost ? '파티 닫기' : '파티 나가기'}
            onPress={handleLeave}
            disabled={isBusy}
            isLoading={isBusy}
          />
        ) : (
          <CommonButton
            title="참여하기"
            onPress={handleJoin}
            disabled={isBusy}
            isLoading={isBusy}
          />
        )}
      </View>
    </ScrollView>
  );
}
