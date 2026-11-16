import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { ProfileService, parseProfileInput } from './profile.service.js';

@Controller('profile')
@UseGuards(AuthGuard)
export class ProfileController {
  constructor(private readonly service: ProfileService) {}

  @Get('me')
  getMine(@Req() req: AuthedRequest) {
    return this.service.getMine(req.userId);
  }

  @Put('me')
  upsertMine(@Req() req: AuthedRequest, @Body() body: Record<string, unknown>) {
    return this.service.upsertMine(req.userId, parseProfileInput(req.userId, body));
  }
}
