import { request } from './client';
import type { Match } from './matching';

export interface Message {
  id: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export interface ChatRoom extends Match {
  lastMessage: Message | null;
}

export const chatApi = {
  rooms: () => request<ChatRoom[]>('/chats'),

  messages: (matchId: string, after?: string) =>
    request<Message[]>(`/chats/${matchId}/messages${after ? `?after=${encodeURIComponent(after)}` : ''}`),

  send: (matchId: string, body: string) => request<Message>(`/chats/${matchId}/messages`, 'POST', { body }),
};
