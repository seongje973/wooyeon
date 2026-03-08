import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { Colors } from "@/constants/Colors";

interface Props {
  type: "kakao" | "google";
  onPress: () => void;
}

const SocialButton: React.FC<Props> = ({ type, onPress }) => {
  const isKakao = type === "kakao";

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isKakao ? styles.kakaoButton : styles.googleButton,
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* 아이콘이 들어갈 자리 (나중에 이미지 추가 가능) */}
      <Text
        style={[styles.text, isKakao ? styles.kakaoText : styles.googleText]}
      >
        {isKakao ? "카카오로 시작하기" : "구글로 시작하기"}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  kakaoButton: {
    backgroundColor: "#FEE500", // 카카오 노란색
  },
  googleButton: {
    backgroundColor: "#FFFFFF", // 구글 흰색
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
  kakaoText: {
    color: "#000000",
  },
  googleText: {
    color: Colors.text,
  },
});

export default SocialButton;
