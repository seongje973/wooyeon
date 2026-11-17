import { BadRequestException, Body, Controller, Delete, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { isUuid } from '../uuid.js';
import { SafetyService } from './safety.service.js';

@Controller()
@UseGuards(AuthGuard)
export class SafetyController {
  constructor(private readonly service: SafetyService) {}

  @Post('safety/blocks')
  @HttpCode(200)
  block(@Req() req: AuthedRequest, @Body() body: { userId?: unknown }) {
    if (!isUuid(body?.userId)) throw new BadRequestException('userId가 필요합니다.');
    return this.service.block(req.userId, body.userId);
  }

  @Post('safety/reports')
  @HttpCode(200)
  report(@Req() req: AuthedRequest, @Body() body: { userId?: unknown; reason?: unknown }) {
    if (!isUuid(body?.userId) || typeof body?.reason !== 'string') {
      throw new BadRequestException('userId와 reason이 필요합니다.');
    }
    return this.service.report(req.userId, body.userId, body.reason);
  }

  @Delete('account')
  deleteAccount(@Req() req: AuthedRequest) {
    return this.service.deleteAccount(req.userId);
  }
}
