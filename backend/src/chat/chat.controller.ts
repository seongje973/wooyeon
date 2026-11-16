import { BadRequestException, Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { ChatService } from './chat.service.js';

@Controller('chats')
@UseGuards(AuthGuard)
export class ChatController {
  constructor(private readonly service: ChatService) {}

  @Get()
  rooms(@Req() req: AuthedRequest) {
    return this.service.rooms(req.userId);
  }

  // 앱은 실시간 신호를 받거나 다시 연결될 때 마지막 메시지 시각을 after로 주고 새 메시지만 가져간다.
  @Get(':matchId/messages')
  messages(
    @Req() req: AuthedRequest,
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Query('after') after?: string,
  ) {
    if (after !== undefined && Number.isNaN(Date.parse(after))) throw new BadRequestException('after가 올바르지 않습니다.');
    return this.service.messages(req.userId, matchId, after);
  }

  @Post(':matchId/messages')
  send(
    @Req() req: AuthedRequest,
    @Param('matchId', ParseUUIDPipe) matchId: string,
    @Body() body: { body?: unknown },
  ) {
    if (typeof body?.body !== 'string') throw new BadRequestException('body가 필요합니다.');
    return this.service.send(req.userId, matchId, body.body);
  }
}
