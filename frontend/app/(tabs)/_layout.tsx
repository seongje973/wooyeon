import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false, // 상단 헤더 숨기기
        tabBarActiveTintColor: '#ff7f00', // 선택됐을 때 (주황색)
        tabBarInactiveTintColor: '#999', // 선택 안 됐을 때 (회색)
        tabBarStyle: {
          height: 60,
          paddingBottom: 10,
        },
      }}
    >
      {/* 1. 메인 홈 */}
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 2. 1:1 매칭 (뽑기) */}
      <Tabs.Screen
        name="match"
        options={{
          title: '뽑기',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'heart' : 'heart-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 3. 다대다 파티 */}
      <Tabs.Screen
        name="party"
        options={{
          title: '파티',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'people' : 'people-outline'} size={24} color={color} />
          ),
        }}
      />

      {/* 4. 메신저 (채팅) */}
      <Tabs.Screen
        name="chat"
        options={{
          title: '채팅',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 5. 마이페이지 */}
      <Tabs.Screen
        name="my"
        options={{
          title: '마이',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
