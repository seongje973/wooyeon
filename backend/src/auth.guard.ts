import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { supabase } from './supabase.js';

export type AuthedRequest = Request & { userId: string };

// 앱이 Supabase 로그인으로 받은 access token을 Authorization: Bearer 로 보낸다.
@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const token = req.headers.authorization?.match(/^Bearer (.+)$/)?.[1];
    if (!token) throw new UnauthorizedException();

    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException();
    req.userId = data.user.id;
    return true;
  }
}
