import React, { useLayoutEffect, useState } from 'react';
import { Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
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
import { Candidate, mockCandidates } from './mockCandidates';
import { styles } from './MatchScreen.styles';

type Decision = 'like' | 'pass';

export default function MatchScreen() {
  const { width } = useWindowDimensions();
  const swipeThreshold = width * 0.25;
  const [index, setIndex] = useState(0);
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const current = mockCandidates[index];
  const next = mockCandidates[index + 1];

  const decide = (decision: Decision) => {
    if (decision === 'like' && current) setLikedIds((ids) => [...ids, current.id]);
    setIndex((i) => i + 1);
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

  if (!current) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>오늘의 인연을 모두 봤어요</Text>
        <Text style={styles.emptyText}>좋아요 {likedIds.length}명 · 내일 새로운 사람이 찾아와요</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.deck}>
        {next && <CandidateCard candidate={next} />}
        <GestureDetector gesture={pan}>
          <Animated.View key={current.id} style={[styles.cardLayer, cardStyle]}>
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
    </GestureHandlerRootView>
  );
}

function CandidateCard({ candidate }: { candidate: Candidate }) {
  return (
    <View style={styles.card}>
      <View style={styles.photo}>
        <Ionicons name="person" size={96} color={Colors.gray400} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>
          {candidate.name} <Text style={styles.age}>{candidate.age}</Text>
        </Text>
        <Text style={styles.school}>
          {candidate.school} · {candidate.major}
        </Text>
        <Text style={styles.distance}>
          {candidate.distanceKm === 0 ? '우리 학교' : `${candidate.distanceKm}km 떨어진 학교`}
        </Text>
        <Text style={styles.tags}>{candidate.tags.join(' ')}</Text>
      </View>
    </View>
  );
}
