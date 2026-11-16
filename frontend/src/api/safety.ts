import { request } from './client';

export const safetyApi = {
  block: (userId: string) => request<{ blocked: true }>('/safety/blocks', 'POST', { userId }),

  report: (userId: string, reason: string) => request<{ reported: true }>('/safety/reports', 'POST', { userId, reason }),

  deleteAccount: () => request<{ deleted: true }>('/account', 'DELETE'),
};
