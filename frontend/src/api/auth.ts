// src/api/auth.ts
import axios from "axios";

const API_URL = "https://api.wooyeon.com"; // 실제 서버 주소로 변경 필요

export const authApi = {
  // 1. 인증 메일 발송 요청
  sendVerificationEmail: async (email: string) => {
    const response = await axios.post(`${API_URL}/auth/email/send`, { email });
    return response.data;
  },

  // 2. 인증 번호 확인 요청
  checkVerificationCode: async (email: string, code: string) => {
    const response = await axios.post(`${API_URL}/auth/email/verify`, {
      email,
      code,
    });
    return response.data; // 인증 성공 시 토큰 등을 반환
  },
};
