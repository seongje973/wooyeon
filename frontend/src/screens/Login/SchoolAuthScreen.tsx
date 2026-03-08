import React, { useState } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommonInput from "@/components/CommonInput";
import CommonButton from "@/components/CommonButton";
import { styles } from "./SchoolAuthScreen.styles";

const SchoolAuthScreen = () => {
  const [email, setEmail] = useState("");
  const isValidEmail = email.endsWith(".ac.kr");

  const handleVerify = () => {
    Alert.alert("인증 메일 발송", `${email}로 인증 메일을 보냈습니다.`);
  };

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
          />
        </View>

        <View style={styles.footer}>
          <CommonButton
            title="인증 메일 받기"
            onPress={handleVerify}
            disabled={!isValidEmail}
          />
          <Text
            style={styles.skipButton}
            onPress={() => Alert.alert("알림", "다음에 인증합니다.")}
          >
            다음에 인증하기
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SchoolAuthScreen;
