import React, { useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import CommonInput from "@/components/CommonInput";
import CommonButton from "@/components/CommonButton";
import { styles } from "./SchoolAuthScreen.styles";
import { findNearbyUniversities, findUniversityByEmail } from '@/lib/university';
import { authApi } from '@/api/auth';

const NEARBY_RADIUS_KM = 10;

const SchoolAuthScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const university = findUniversityByEmail(email);
  const isValidEmail = university !== undefined;
  const nearbyCount = university ? findNearbyUniversities(university, NEARBY_RADIUS_KM).length : 0;

  const run = async (action: () => Promise<void>) => {
    setIsLoading(true);
    setMessage('');
    try {
      await action();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () =>
    run(async () => {
      await authApi.sendVerificationEmail(email);
      setIsSent(true);
      setMessage(`${email}로 인증번호를 보냈어요.`);
    });

  const handleVerify = () =>
    run(async () => {
      await authApi.checkVerificationCode(code);
      router.replace('/(tabs)');
    });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>마지막 단계예요! 🎓</Text>
          <Text style={styles.description}>
            안전한 커뮤니티를 위해{"\n"}
            학교 이메일 인증을 완료해 주세요.
          </Text>
        </View>

        <View style={styles.form}>
          <CommonInput
            label="학교 이메일"
            placeholder="example@univ.ac.kr"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isSent}
          />
          {university && (
            <Text style={styles.schoolInfo}>
              {`${university.name} · 주변 ${NEARBY_RADIUS_KM}km 안 학교 ${nearbyCount}곳과도 만날 수 있어요`}
            </Text>
          )}
          {!university && email.includes('@') && (
            <Text style={styles.schoolError}>아직 지원하지 않는 학교 이메일이에요.</Text>
          )}
          {isSent && (
            <View style={styles.codeInput}>
              <CommonInput
                label="인증번호 6자리"
                placeholder="000000"
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>
          )}
          {message !== '' && <Text style={styles.message}>{message}</Text>}
        </View>

        <View style={styles.footer}>
          {isSent ? (
            <CommonButton
              title="인증 확인"
              onPress={handleVerify}
              disabled={code.length !== 6}
              isLoading={isLoading}
            />
          ) : (
            <CommonButton
              title="인증 메일 받기"
              onPress={handleSend}
              disabled={!isValidEmail}
              isLoading={isLoading}
            />
          )}
          {isSent && (
            <Text style={styles.skipButton} onPress={handleSend}>
              인증번호 다시 받기
            </Text>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SchoolAuthScreen;
