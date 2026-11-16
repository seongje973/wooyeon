import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import PhotoScrim from '@/components/PhotoScrim';
import Wordmark from '@/components/Wordmark';
import { Colors } from '@/constants/Colors';
import { Candidate, Match, matchingApi } from '@/api/matching';
import { styles } from './HomeScreen.styles';

const PREVIEW_COUNT = 5;

export default function HomeScreen() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);

  // 매칭 탭에서 고르거나 매칭이 생긴 뒤 돌아오면 바뀐 내용을 다시 받는다.
  useFocusEffect(
    useCallback(() => {
      matchingApi
        .candidates()
        .then((list) => setCandidates(list.slice(0, PREVIEW_COUNT)))
        .catch(() => setCandidates([]));
      matchingApi
        .matches()
        .then(setMatches)
        .catch(() => setMatches([]));
    }, []),
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Wordmark />
          <TouchableOpacity style={styles.bellButton}>
            <Ionicons name="notifications-outline" size={22} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>오늘의 우연</Text>
        <Text style={styles.greeting}>가까운 학교에서 찾은 사람들이에요</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.cardList}
        >
          {candidates.map((c) => (
            <ProfileCard key={c.userId} candidate={c} onPress={() => router.push('/match')} />
          ))}
          {candidates.length === 0 && (
            <View style={[styles.card, styles.emptyCard]}>
              <Text style={styles.emptyText}>지금은 새로운 추천이 없어요</Text>
            </View>
          )}
        </ScrollView>

        {matches.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>새로운 인연</Text>
              <TouchableOpacity onPress={() => router.push('/chat')}>
                <Text style={styles.moreText}>더보기</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.matchList}
            >
              {matches.map((m) => (
                <TouchableOpacity
                  key={m.matchId}
                  style={styles.matchItem}
                  onPress={() =>
                    router.push({
                      pathname: '/chat/[id]',
                      params: { id: m.matchId, name: m.user.nickname, userId: m.user.userId },
                    })
                  }
                >
                  <View style={styles.matchRing}>
                    {m.user.photoUrl ? (
                      <Image source={{ uri: m.user.photoUrl }} style={styles.matchAvatar} />
                    ) : (
                      <View style={styles.matchAvatar}>
                        <Ionicons name="person" size={28} color={Colors.gray400} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.matchName} numberOfLines={1}>
                    {m.user.nickname}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>우리 학교 인기글</Text>
          <TouchableOpacity>
            <Text style={styles.moreText}>더보기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.boardContainer}>
          <BoardItem title="이번 축제 라인업 떴다 ㅋㅋ" time="10분 전" likes={52} />
          <BoardItem title="도서관 자리 있나요?" time="30분 전" likes={12} />
          <BoardItem title="학교 근처 맛집 추천좀요" time="1시간 전" likes={8} />
        </View>
        <View style={styles.footerSpace} />
      </ScrollView>
    </SafeAreaView>
  );
}

// (부품 컴포넌트들도 styles를 가져와서 씁니다)
const ProfileCard = ({ candidate, onPress }: { candidate: Candidate; onPress: () => void }) => (
  <TouchableOpacity style={[styles.card, styles.profileCard]} onPress={onPress}>
    {candidate.photoUrl ? (
      <Image source={{ uri: candidate.photoUrl }} style={styles.cardPhoto} />
    ) : (
      <View style={styles.cardImagePlaceholder}>
        <Ionicons name="person" size={40} color={Colors.gray400} />
      </View>
    )}
    <PhotoScrim />
    <Text style={styles.cardTag}>
      {candidate.distanceKm === 0 ? '우리 학교' : `${candidate.distanceKm}km`}
    </Text>
    <Text style={styles.cardName}>
      {candidate.nickname} {candidate.age}
    </Text>
    <Text style={styles.cardMajor} numberOfLines={1}>
      {candidate.universityName}
    </Text>
  </TouchableOpacity>
);

const BoardItem = ({ title, time, likes }: any) => (
  <TouchableOpacity style={styles.boardItem}>
    <View>
      <Text style={styles.boardTitle}>{title}</Text>
      <Text style={styles.boardTime}>{time}</Text>
    </View>
    <View style={styles.likeBox}>
      <Ionicons name="heart-outline" size={14} color={Colors.love} />
      <Text style={styles.likeCount}>{likes}</Text>
    </View>
  </TouchableOpacity>
);
