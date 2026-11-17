import { request } from './client';

export const authApi = {
  verificationStatus: () =>
    request<{ verified: boolean; universityId?: string }>('/verification/school-email'),

  sendVerificationEmail: (email: string) =>
    request<{ universityId: string }>('/verification/school-email/send', 'POST', { email }),

  checkVerificationCode: (code: string) =>
    request<{ universityId: string; email: string }>('/verification/school-email/verify', 'POST', {
      code,
    }),
};
