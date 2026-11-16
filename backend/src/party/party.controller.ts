import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard, type AuthedRequest } from '../auth.guard.js';
import { PartyService, parsePartyInput } from './party.service.js';

@Controller('parties')
@UseGuards(AuthGuard)
export class PartyController {
  constructor(private readonly service: PartyService) {}

  @Get()
  list(@Req() req: AuthedRequest) {
    return this.service.list(req.userId);
  }

  @Post()
  create(@Req() req: AuthedRequest, @Body() body: Record<string, unknown>) {
    return this.service.create(req.userId, parsePartyInput(body));
  }

  @Get(':partyId')
  detail(@Req() req: AuthedRequest, @Param('partyId', ParseUUIDPipe) partyId: string) {
    return this.service.detail(req.userId, partyId);
  }

  @Post(':partyId/members')
  join(@Req() req: AuthedRequest, @Param('partyId', ParseUUIDPipe) partyId: string) {
    return this.service.join(req.userId, partyId);
  }

  @Delete(':partyId/members/me')
  leave(@Req() req: AuthedRequest, @Param('partyId', ParseUUIDPipe) partyId: string) {
    return this.service.leave(req.userId, partyId);
  }
}
