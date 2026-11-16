import React, { useCallback, useLayoutEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
import PhotoScrim from '@/components/PhotoScrim';
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
  // 뒤 카드는 살짝 작게 있다가 앞 카드를 밀수록 제 크기로 커진다.
  const nextStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(Math.abs(translateX.value), [0, swipeThreshold], [0.94, 1], 'clamp') },
    ],
  }));

  const matchNotice = matched && (
    <Modal transparent animationType="fade" onRequestClose={() => setMatched(null)}>
      <View style={styles.matchOverlay}>
        <View style={styles.matchPhotoWrap}>
          {matched.candidate.photoUrl ? (
            <Image source={{ uri: matched.candidate.photoUrl }} style={styles.matchPhoto} />
          ) : (
            <View style={styles.matchPhoto}>
              <Ionicons name="person" size={72} color={Colors.gray400} />
            </View>
          )}
          <View style={styles.matchHeart}>
            <Ionicons name="heart" size={28} color={Colors.white} />
          </View>
        </View>
        <Text style={styles.matchTitle}>우연이 닿았어요!</Text>
        <Text style={styles.matchText}>
          {matched.candidate.nickname}님도 회원님을 좋아해요.{'\n'}먼저 인사를 건네 보세요.
        </Text>
        <TouchableOpacity
          style={styles.matchButton}
          onPress={() => {
            setMatched(null);
            router.push({ pathname: '/chat/[id]', params: { id: matched.matchId, name: matched.candidate.nickname, userId: matched.candidate.userId } });
          }}
        >
          <Text style={styles.matchButtonText}>먼저 인사하기</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setMatched(null)}>
          <Text style={styles.matchLater}>계속 둘러보기</Text>
        </TouchableOpacity>
      </View>
    </Modal>
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
        <View style={styles.emptyIcon}>
          <Ionicons name="heart-outline" size={40} color={Colors.primary} />
        </View>
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
        {next && (
          <Animated.View style={[styles.cardLayer, nextStyle]}>
            <CandidateCard candidate={next} />
          </Animated.View>
        )}
        <GestureDetector gesture={pan}>
          <Animated.View key={current.userId} style={[styles.cardLayer, cardStyle]}>
            <CandidateCard candidate={current} />
            <Animated.Text style={[styles.stamp, styles.likeStamp, likeStyle]}>좋아요</Animated.Text>
            <Animated.Text style={[styles.stamp, styles.passStamp, passStyle]}>다음에</Animated.Text>
          </Animated.View>
        </GestureDetector>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.passButton}
          onPress={() => flyOut('pass')}
          accessibilityLabel="넘기기"
        >
          <Ionicons name="close" size={32} color={Colors.gray800} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.likeButton}
          onPress={() => flyOut('like')}
          accessibilityLabel="좋아요"
        >
          <Ionicons name="heart" size={36} color={Colors.white} />
        </TouchableOpacity>
      </View>
      {matchNotice}
    </GestureHandlerRootView>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <View style={styles.card}>
      {candidate.photoUrl ? (
        <Image source={{ uri: candidate.photoUrl }} style={styles.photoImage} />
      ) : (
        <View style={styles.photoEmpty}>
          <Ionicons name="person" size={96} color={Colors.gray400} />
        </View>
      )}
      <PhotoScrim />
      <View style={styles.info}>
        <Text style={styles.name}>
          {candidate.nickname} <Text style={styles.age}>{candidate.age}</Text>
        </Text>
        <View style={styles.metaRow}>
          <Ionicons name="school" size={15} color={Colors.white} />
          <Text style={styles.school}>{candidate.universityName}</Text>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {candidate.distanceKm === 0 ? '우리 학교' : `${candidate.distanceKm}km`}
            </Text>
          </View>
        </View>
        {candidate.bio !== '' && (
          <Text style={styles.bio} numberOfLines={2}>
            {candidate.bio}
          </Text>
        )}
      </View>
    </View>
  );
}
