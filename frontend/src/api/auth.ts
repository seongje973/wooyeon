import { request } from './client';

export const authApi = {
  sendVerificationEmail: (email: string) =>
    request<{ universityId: string }>('/verification/school-email/send', 'POST', { email }),

  checkVerificationCode: (code: string) =>
    request<{ universityId: string; email: string }>('/verification/school-email/verify', 'POST', {
      code,
    }),
};
