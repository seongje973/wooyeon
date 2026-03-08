import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/screens/Login/LoginScreen.styles"; // 기존 로그인 스타일 재활용
import { Colors } from "@/constants/Colors";

const EmailAuthScreen: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [authCode, setAuthCode] = useState<string>("");
  const [isSent, setIsSent] = useState<boolean>(false); // 메일 발송 여부

  // 학교 메일 형식 검사 (@ac.kr로 끝나는지)
  const isValidEmail = email.endsWith(".ac.kr");

  const handleSendEmail = async () => {
    // TODO: src/api/auth.ts의 sendVerificationEmail 호출
    console.log(`${email}로 인증 메일을 보냅니다.`);
    setIsSent(true);
    Alert.alert("발송 완료", "학교 이메일로 인증번호가 전송되었습니다.");
  };

  const handleVerifyCode = () => {
    // TODO: src/api/auth.ts의 checkVerificationCode 호출
    if (authCode === "123456") {
      // 임시 테스트용 번호
      Alert.alert("인증 성공", "학교 인증이 완료되었습니다!");
    } else {
      Alert.alert("인증 실패", "인증번호를 다시 확인해 주세요.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>학교 이메일 인증</Text>
        <Text style={styles.subtitle}>
          본인 확인을 위해 학교 이메일(@ac.kr){"\n"}
          인증이 필요합니다.
        </Text>
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>학교 이메일 주소</Text>
        <TextInput
          style={styles.input}
          placeholder="example@university.ac.kr"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!isSent} // 메일 발송 후에는 이메일 수정 불가
        />
      </View>

      {isSent && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>인증번호 6자리</Text>
          <TextInput
            style={styles.input}
            placeholder="000000"
            value={authCode}
            onChangeText={setAuthCode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          (!isValidEmail || (isSent && authCode.length < 6)) &&
            styles.buttonDisabled,
        ]}
        onPress={isSent ? handleVerifyCode : handleSendEmail}
        disabled={!isValidEmail || (isSent && authCode.length < 6)}
      >
        <Text style={styles.buttonText}>
          {isSent ? "인증 확인" : "인증번호 받기"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default EmailAuthScreen;
