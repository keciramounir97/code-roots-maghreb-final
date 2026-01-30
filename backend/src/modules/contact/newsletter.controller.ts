import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';

@Controller('api')
export class NewsletterController {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    @Post('newsletter/subscribe')
    async subscribe(@Body() body: { email: string }) {
        try {
            const email = String(body.email || '').trim().toLowerCase();
            const from = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('SMTP_USER');

            await this.mailerService.sendMail({
                from: from,
                to: email,
                subject: 'Roots Maghreb Newsletter',
                text: `Thanks for joining Roots Maghreb. We will reach out to you soon at ${email}.`,
                html: `
          <div style="font-family: Arial, sans-serif; color: #2c1810;">
            <h2 style="color:#5d4037;">Welcome to Roots Maghreb</h2>
            <p>Thanks for joining our newsletter.</p>
            <p>We will reach out to you soon at <strong>${email}</strong>.</p>
            <p style="margin-top:20px;">- Roots Maghreb</p>
          </div>
        `,
            });

            return { message: 'Subscribed' };
        } catch (err) {
            console.error(err);
            throw new InternalServerErrorException('Failed to subscribe');
        }
    }
}
