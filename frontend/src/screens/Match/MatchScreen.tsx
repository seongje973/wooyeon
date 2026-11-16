import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { ApiError } from '@/api/client';
import { Candidate, matchingApi } from '@/api/matching';
import { styles } from './MatchScreen.styles';

type Decision = 'like' | 'pass';

export default function MatchScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const swipeThreshold = width * 0.25;
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [index, setIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [matched, setMatched] = useState<{ candidate: Candidate; matchId: string } | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const current = candidates[index];
  const next = candidates[index + 1];

  // 탭에 들어올 때마다 다시 받는다. 프로필에서 만날 범위를 바꾸면 바로 반영된다.
  const load = useCallback(() => {
    setIsLoading(true);
    setMessage('');
    matchingApi
      .candidates()
      .then((list) => {
        setCandidates(list);
        setIndex(0);
      })
      .catch((err) => setMessage((err as Error).message))
      .finally(() => setIsLoading(false));
  }, []);
  useFocusEffect(load);

  const decide = (decision: Decision) => {
    if (!current) return;
    setIndex((i) => i + 1);
    matchingApi
      .swipe(current.userId, decision === 'like')
      .then((result) => {
        if (result.matchId) setMatched({ candidate: current, matchId: result.matchId });
      })
      .catch((err) => {
        // 다른 기기에서 이미 고른 상대(409)는 넘어간 것으로 본다.
        if (!(err instanceof ApiError && err.status === 409)) setMessage((err as Error).message);
      });
  };

  // 다음 카드가 그려진 뒤에 위치를 되돌려야 날아간 카드가 가운데로 잠깐 돌아오지 않는다.
  useLayoutEffect(() => {
    translateX.value = 0;
    translateY.value = 0;
  }, [index, translateX, translateY]);

  const flyOut = (decision: Decision) => {
    'worklet';
    const toX = (decision === 'like' ? 1 : -1) * width * 1.5;
    translateX.value = withTiming(toX, { duration: 200 }, (finished) => {
      // 버튼을 연달아 누르면 앞 애니메이션이 끊기며 finished=false로 불린다. 한 번만 넘긴다.
      if (finished) scheduleOnRN(decide, decision);
    });
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = e.translationX;
      translateY.value = e.translationY;
    })
    .onEnd(() => {
      if (translateX.value > swipeThreshold) flyOut('like');
      else if (translateX.value < -swipeThreshold) flyOut('pass');
      else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${interpolate(translateX.value, [-width, width], [-15, 15])}deg` },
    ],
  }));
  const likeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [0, swipeThreshold], [0, 1], 'clamp'),
  }));
  const passStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateX.value, [-swipeThreshold, 0], [1, 0], 'clamp'),
  }));

  const matchNotice = matched && (
    <View style={styles.matchOverlay}>
      <Text style={styles.matchTitle}>서로 좋아요!</Text>
      <Text style={styles.matchText}>{matched.candidate.nickname}님과 연결됐어요. 먼저 인사해 보세요.</Text>
      <TouchableOpacity
        style={styles.matchButton}
        onPress={() => {
          setMatched(null);
          router.push({ pathname: '/chat/[id]', params: { id: matched.matchId, name: matched.candidate.nickname } });
        }}
      >
        <Text style={styles.matchButtonText}>채팅하러 가기</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setMatched(null)}>
        <Text style={styles.matchLater}>계속 둘러보기</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.empty}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>{message ? '후보를 불러오지 못했어요' : '지금은 새로운 사람이 없어요'}</Text>
        <Text style={styles.emptyText}>{message || '만날 학교 범위를 넓히거나 나중에 다시 와 주세요'}</Text>
        <TouchableOpacity onPress={load}>
          <Text style={styles.reload}>다시 불러오기</Text>
        </TouchableOpacity>
        {matchNotice}
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      {message !== '' && <Text style={styles.message}>{message}</Text>}
      <View style={styles.deck}>
        {next && <CandidateCard candidate={next} />}
        <GestureDetector gesture={pan}>
          <Animated.View key={current.userId} style={[styles.cardLayer, cardStyle]}>
            <CandidateCard candidate={current} />
            <Animated.Text style={[styles.stamp, styles.likeStamp, likeStyle]}>LIKE</Animated.Text>
            <Animated.Text style={[styles.stamp, styles.passStamp, passStyle]}>PASS</Animated.Text>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => flyOut('pass')}
          accessibilityLabel="넘기기"
        >
          <Ionicons name="close" size={32} color={Colors.gray600} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => flyOut('like')}
          accessibilityLabel="좋아요"
        >
          <Ionicons name="heart" size={32} color={Colors.love} />
        </TouchableOpacity>
      </View>
      {matchNotice}
    </GestureHandlerRootView>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        {candidate.photoUrl ? (
          <Image source={{ uri: candidate.photoUrl }} style={styles.photoImage} />
        ) : (
          <Ionicons name="person" size={96} color={Colors.gray400} />
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {candidate.nickname} <Text style={styles.age}>{candidate.age}</Text>
        </Text>
        <Text style={styles.school}>{candidate.universityName}</Text>
        <Text style={styles.distance}>
          {candidate.distanceKm === 0 ? '우리 학교' : `${candidate.distanceKm}km 떨어진 학교`}
        </Text>
        {candidate.bio !== '' && (
          <Text style={styles.bio} numberOfLines={3}>
            {candidate.bio}
          </Text>
        )}
      </View>
    </View>
  );
}
