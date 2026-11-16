export const sendVerificationMail = async (to: string, code: string): Promise<void> => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === 'production') throw new Error('RESEND_API_KEY가 없습니다.');
    // 로컬 개발에서 메일 서비스 없이 흐름을 확인하기 위한 출력. 운영에서는 위에서 막힌다.
    console.log(`[dev] ${to} 인증번호: ${code}`);
    return;
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: process.env.MAIL_FROM,
      to,
      subject: '[우연] 학교 인증번호',
      text: `인증번호는 ${code} 입니다. 10분 안에 입력해 주세요.`,
    }),
  });
  if (!res.ok) throw new Error(`메일 발송 실패: ${res.status}`);
};
