import { Module } from '@nestjs/common';
import { VerificationController } from './verification/verification.controller.js';
import { VerificationService } from './verification/verification.service.js';

@Module({
  controllers: [VerificationController],
  providers: [VerificationService],
})
export class AppModule {}
