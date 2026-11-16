import { BadRequestException, Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { VerificationService } from './verification.service.js';

@Controller('verification/school-email')
@UseGuards(AuthGuard)
export class VerificationController {
  constructor(private readonly service: VerificationService) {}

  @Post('send')
  @HttpCode(200)
  send(@Req() req: AuthedRequest, @Body() body: { email?: unknown }) {
    if (typeof body?.email !== 'string') throw new BadRequestException('email이 필요합니다.');
    return this.service.send(req.userId, body.email);
  }

  @Post('verify')
  @HttpCode(200)
  verify(@Req() req: AuthedRequest, @Body() body: { code?: unknown }) {
    if (typeof body?.code !== 'string' || !/^\d{6}$/.test(body.code)) {
      throw new BadRequestException('6자리 인증번호가 필요합니다.');
    }
    return this.service.verify(req.userId, body.code);
  }
}
