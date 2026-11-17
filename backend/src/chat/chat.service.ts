import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { supabase } from '../supabase.js';
import { MatchingService } from '../matching/matching.service.js';
import { blockedUserIds } from '../safety/blocks.js';

const PAGE_SIZE = 100;
const MAX_MESSAGES_PER_MINUTE = 30;

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
    const other = data.user_a === userId ? data.user_b : data.user_a;
    if ((await blockedUserIds(userId)).has(other)) throw new ForbiddenException('이 채팅방에 들어갈 수 없습니다.');
  }

  async rooms(userId: string) {
    const matches = await this.matching.matches(userId);
    if (!matches.length) return [];
    const { data, error } = await supabase.rpc('last_messages', { p_matches: matches.map((m) => m.matchId) });
    if (error) throw error;
    const last = new Map(((data ?? []) as (MessageRow & { match_id: string })[]).map((row) => [row.match_id, row]));
    return matches.map((m) => {
      const row = last.get(m.matchId);
      return { ...m, lastMessage: row ? toMessage(row) : null };
    });
  }

  async messages(userId: string, matchId: string, after?: string) {
    await this.assertMember(userId, matchId);
    const query = supabase
      .from('messages')
      .select('id, sender, body, created_at')
      .eq('match_id', matchId);
    // after가 없으면 가장 최근 것부터 잘라야 긴 대화에서도 마지막 메시지가 보인다.
    const { data, error } = after
      ? await query.gt('created_at', after).order('created_at', { ascending: true }).limit(PAGE_SIZE)
      : await query.order('created_at', { ascending: false }).limit(PAGE_SIZE);
    if (error) throw error;
    const rows = after ? (data ?? []) : (data ?? []).reverse();
    return rows.map(toMessage);
  }

  async send(userId: string, matchId: string, rawBody: string) {
    const body = rawBody.trim();
    if (body.length < 1 || body.length > 1000) throw new BadRequestException('메시지는 1~1000자여야 합니다.');
    await this.assertMember(userId, matchId);
    const minuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender', userId)
      .gt('created_at', minuteAgo);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_MESSAGES_PER_MINUTE) {
      throw new HttpException('메시지를 너무 빨리 보내고 있습니다. 잠시 후 다시 시도해 주세요.', HttpStatus.TOO_MANY_REQUESTS);
    }
    const { data, error } = await supabase
      .from('messages')
      .insert({ match_id: matchId, sender: userId, body })
      .select('id, sender, body, created_at')
      .single();
    if (error) throw error;
    return toMessage(data);
  }
}
