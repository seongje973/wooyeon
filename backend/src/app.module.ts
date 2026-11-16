import { Module } from '@nestjs/common';
import { ChatController } from './chat/chat.controller.js';
import { ChatService } from './chat/chat.service.js';
import { MatchingController } from './matching/matching.controller.js';
import { MatchingService } from './matching/matching.service.js';
import { ProfileController } from './profile/profile.controller.js';
import { ProfileService } from './profile/profile.service.js';
import { VerificationController } from './verification/verification.controller.js';
import { VerificationService } from './verification/verification.service.js';

@Module({
  controllers: [VerificationController, ProfileController, MatchingController, ChatController],
  providers: [VerificationService, ProfileService, MatchingService, ChatService],
})
export class AppModule {}
