import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);

    async sendEmailVerifictation(email: string, token: string) {
        const verificationLink = `http://localhost:3000/auth/verify-email?token=${token}`;
        this.logger.log(`Send email verification to ${email}: ${verificationLink}`);
    }

    async sendPasswordReset(email: string, token: string) {
        const resetLink = `http://localhost:3000/auth/reset-password?token=${token}`;
        this.logger.log(`Send password reset to ${email}: ${resetLink}`);
    }

}
