import { BadRequestException, Injectable } from '@nestjs/common';
import { supabase } from '../supabase.js';

const PHOTO_BUCKET = 'profile-photos';

@Injectable()
export class SafetyService {
  async block(userId: string, targetUserId: string) {
    if (targetUserId === userId) throw new BadRequestException('자기 자신은 차단할 수 없습니다.');
    const { error } = await supabase
      .from('blocks')
      .upsert({ blocker: userId, blocked: targetUserId }, { onConflict: 'blocker,blocked', ignoreDuplicates: true });
    if (error) throw error;
    return { blocked: true };
  }

  async report(userId: string, targetUserId: string, rawReason: string) {
    const reason = rawReason.trim();
    if (targetUserId === userId) throw new BadRequestException('자기 자신은 신고할 수 없습니다.');
    if (reason.length < 1 || reason.length > 500) throw new BadRequestException('신고 사유는 1~500자여야 합니다.');
    const { error } = await supabase.from('reports').insert({ reporter: userId, reported: targetUserId, reason });
    if (error) throw error;
    return { reported: true };
  }

  async deleteAccount(userId: string) {
    // 테이블 행은 auth.users의 on delete cascade로 지워지지만, Storage 파일은 따로 지운다.
    const { data: files, error: listError } = await supabase.storage.from(PHOTO_BUCKET).list(userId);
    if (listError) throw listError;
    if (files?.length) {
      const { error: removeError } = await supabase.storage
        .from(PHOTO_BUCKET)
        .remove(files.map((f) => `${userId}/${f.name}`));
      if (removeError) throw removeError;
    }
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
    return { deleted: true };
  }
}
