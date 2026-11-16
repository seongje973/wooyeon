import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { MatchingService } from './matching.service.js';

@Controller('matching')
@UseGuards(AuthGuard)
export class MatchingController {
  constructor(private readonly service: MatchingService) {}

  @Get('candidates')
  candidates(@Req() req: AuthedRequest) {
    return this.service.candidates(req.userId);
  }

  @Post('swipes')
  @HttpCode(200)
  swipe(@Req() req: AuthedRequest, @Body() body: { targetUserId?: unknown; liked?: unknown }) {
    if (typeof body?.targetUserId !== 'string' || typeof body?.liked !== 'boolean') {
      throw new BadRequestException('targetUserId와 liked가 필요합니다.');
    }
    return this.service.swipe(req.userId, body.targetUserId, body.liked);
  }

  @Get('matches')
  matches(@Req() req: AuthedRequest) {
    return this.service.matches(req.userId);
  }

  @Delete('matches/:matchId')
  unmatch(@Req() req: AuthedRequest, @Param('matchId', ParseUUIDPipe) matchId: string) {
    return this.service.unmatch(req.userId, matchId);
  }
}
