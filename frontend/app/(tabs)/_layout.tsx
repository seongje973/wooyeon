import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Wordmark from '@/components/Wordmark';
import { Colors } from '@/constants/Colors';
import { Shadow } from '@/constants/GlobalStyle';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerShadowVisible: false,
        headerTitleAlign: 'left',
        headerTitleStyle: { fontSize: 22, fontWeight: '800', color: Colors.text },
        headerStyle: { backgroundColor: Colors.background },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray400,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { borderTopWidth: 0, backgroundColor: Colors.white, ...Shadow.bar },
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
          title: '매칭',
          headerTitle: () => <Wordmark />,
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
