// src/constants/Colors.ts

export const Colors = {
  // 메인 브랜딩 컬러 (우연 핑크)
  primary: "#FF6B6B",
  primaryLight: "#FF8787",
  primaryDark: "#FA5252",

  // 포인트 및 보조 컬러
  secondary: "#FFD93D", // 노란색 포인트 (알림, 별점 등)
  accent: "#4DABF7", // 파란색 (남성 유저 또는 확인 버튼)
  love: "#F783AC", // 핑크색 (하트, 매칭 관련)

  // 무채색 (텍스트 및 배경)
  white: "#FFFFFF",
  black: "#212529",
  background: "#FFFFFF",

  // 회색조 (가독성을 위해 단계별로 구성)
  gray100: "#F8F9FA", // 아주 연한 배경색
  gray200: "#E9ECEF", // 구분선
  gray400: "#CED4DA", // 비활성화된 버튼이나 입력창 테두리
  gray600: "#868E96", // 부연 설명 텍스트
  gray800: "#495057", // 본문 텍스트
  // 기본 텍스트
  text: "#222222",

  // 상태 컬러
  success: "#51CF66",
  error: "#FF2E2E",
  warning: "#FCC419",

  // 투명도 포함 (필요 시)
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;

// 타입 추론을 위한 export
export type ColorKeys = keyof typeof Colors;
