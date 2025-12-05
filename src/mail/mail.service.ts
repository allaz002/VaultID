import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  async sendEmailVerification(email: string, token: string) {
    const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;

    await new Promise((resolve) => resolve(null));

    this.logger.log(`Send email verification to ${email}: ${verificationLink}`);
  }

  async sendPasswordReset(email: string, token: string) {
    const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;

    await new Promise((resolve) => resolve(null));

    this.logger.log(`Send password reset to ${email}: ${resetLink}`);
  }
}
