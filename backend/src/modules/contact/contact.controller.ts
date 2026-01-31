
import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';

@Controller()
export class ContactController {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    @Post('contact')
    async sendContact(@Body() body: ContactDto) {
        const { name, email, message } = body;
        const from = this.configService.get<string>('EMAIL_FROM') || this.configService.get<string>('SMTP_USER');
        const to = this.configService.get<string>('SMTP_USER');
        if (!from || !to) {
            return { message: 'Message received. Email delivery is temporarily unavailable.' };
        }
        try {
            const safeMessage = message ? message.replace(/\n/g, '<br>') : '';
            const safeName = String(name ?? '').trim();
            const safeEmail = String(email ?? '').trim();

            await this.mailerService.sendMail({
                from: String(from),
                to: String(to),
                replyTo: safeEmail,
                subject: `New Contact Message from ${safeName}`,
                text: `
          Name: ${safeName}
          Email: ${safeEmail}
          Message:
          ${message}
        `,
                html: `
          <h3>New Contact Message</h3>
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${safeEmail}</p>
          <p><strong>Message:</strong></p>
          <blockquote style="background:#f9f9f9; padding:10px; border-left:4px solid #ccc;">
            ${safeMessage}
          </blockquote>
        `,
            });

            return { message: 'Message sent successfully' };
        } catch (err) {
            console.error('Contact form mail error:', err?.message || err);
            return { message: 'Message received. Email delivery may be delayed.' };
        }
    }
}
