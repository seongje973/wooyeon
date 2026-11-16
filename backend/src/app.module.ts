import { Module } from '@nestjs/common';
import { ProfileController } from './profile/profile.controller.js';
import { ProfileService } from './profile/profile.service.js';
import { VerificationController } from './verification/verification.controller.js';
import { VerificationService } from './verification/verification.service.js';

@Module({
  controllers: [VerificationController, ProfileController],
  providers: [VerificationService, ProfileService],
})
export class AppModule {}
