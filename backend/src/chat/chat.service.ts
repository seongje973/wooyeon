import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { MatchingService } from '../matching/matching.service.js';

const PAGE_SIZE = 100;

interface MessageRow {
  id: string;
  sender: string;
  body: string;
  created_at: string;
}

const toMessage = (m: MessageRow) => ({ id: m.id, senderId: m.sender, body: m.body, createdAt: m.created_at });

@Injectable()
export class ChatService {
  constructor(private readonly matching: MatchingService) {}

  private async assertMember(userId: string, matchId: string) {
    const { data, error } = await supabase
      .from('matches')
      .select('user_a, user_b')
      .eq('id', matchId)
      .maybeSingle();
    if (error) throw error;
    if (!data || (data.user_a !== userId && data.user_b !== userId)) {
      throw new ForbiddenException('이 채팅방에 들어갈 수 없습니다.');
    }
  }

  async rooms(userId: string) {
    const matches = await this.matching.matches(userId);
    return Promise.all(
      matches.map(async (m) => {
        const { data, error } = await supabase
          .from('messages')
          .select('id, sender, body, created_at')
          .eq('match_id', m.matchId)
          .order('created_at', { ascending: false })
          .limit(1);
        if (error) throw error;
        return { ...m, lastMessage: data?.[0] ? toMessage(data[0]) : null };
      }),
    );
  }

  async messages(userId: string, matchId: string, after?: string) {
    await this.assertMember(userId, matchId);
    let query = supabase
      .from('messages')
      .select('id, sender, body, created_at')
      .eq('match_id', matchId);
    if (after) query = query.gt('created_at', after);
    const { data, error } = await query.order('created_at', { ascending: true }).limit(PAGE_SIZE);
    if (error) throw error;
    return (data ?? []).map(toMessage);
  }

  async send(userId: string, matchId: string, rawBody: string) {
    const body = rawBody.trim();
    if (body.length < 1 || body.length > 1000) throw new BadRequestException('메시지는 1~1000자여야 합니다.');
    await this.assertMember(userId, matchId);
    const { data, error } = await supabase
      .from('messages')
      .insert({ match_id: matchId, sender: userId, body })
      .select('id, sender, body, created_at')
      .single();
    if (error) throw error;
    return toMessage(data);
  }
}
