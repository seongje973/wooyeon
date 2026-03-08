import { Redirect } from 'expo-router';

export default function LandingScreen() {
  // 뺑글이(ActivityIndicator) 삭제! ❌
  // 앱 켜지자마자 바로 메인 탭 화면(/(tabs))으로 보내버립니다. 🚀
  return <Redirect href="/(tabs)" />;
}
