import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './HomeScreen.styles'; // 👈 분리한 스타일 불러오기

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>반가워요! 👋</Text>
          <Text style={styles.title}>
            오늘의 <Text style={styles.highlight}>우연</Text>을 만나보세요
          </Text>
        </View>
        <TouchableOpacity style={styles.bellButton}>
          <Ionicons name="notifications-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardList}
      >
        <ProfileCard name="김우연" major="컴퓨터공학 21" tag="#코딩 #맛집탐방" color="#FFF0F0" />
        <ProfileCard name="이디자인" major="시각디자인 23" tag="#전시회 #카페" color="#F0F8FF" />
        <ProfileCard name="박운동" major="체육학과 20" tag="#헬스 #러닝" color="#F5F5DC" />
      </ScrollView>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>🔥 우리 학교 인기글</Text>
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
  );
}

// (부품 컴포넌트들도 styles를 가져와서 씁니다)
const ProfileCard = ({ name, major, tag, color }: any) => (
  <TouchableOpacity style={[styles.card, { backgroundColor: color }]}>
    <View style={styles.cardImagePlaceholder}>
      <Ionicons name="person" size={40} color="#ddd" />
    </View>
    <Text style={styles.cardName}>{name}</Text>
    <Text style={styles.cardMajor}>{major}</Text>
    <Text style={styles.cardTag}>{tag}</Text>
  </TouchableOpacity>
);

const BoardItem = ({ title, time, likes }: any) => (
  <TouchableOpacity style={styles.boardItem}>
    <View>
      <Text style={styles.boardTitle}>{title}</Text>
      <Text style={styles.boardTime}>{time}</Text>
    </View>
    <View style={styles.likeBox}>
      <Ionicons name="heart-outline" size={14} color="#ff7f00" />
      <Text style={styles.likeCount}>{likes}</Text>
    </View>
  </TouchableOpacity>
);
