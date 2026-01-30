
import { Controller, Post, Body, InternalServerErrorException } from '@nestjs/common';
import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';

@Controller('api')
export class ContactController {
    constructor(
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService
    ) { }

    @Post('contact')
    async sendContact(@Body() body: ContactDto) {
        try {
            const { name, email, message } = body;
            const safeName = name;
            const safeEmail = email;
            const safeMessage = message ? message.replace(/\n/g, '<br>') : '';

            const from = this.configService.get<string>('EMAIL_FROM');
            const to = this.configService.get<string>('SMTP_USER');

            await this.mailerService.sendMail({
                from: from,
                to: to,
                replyTo: email,
                subject: `New Contact Message from ${name}`,
                text: `
          Name: ${name}
          Email: ${email}
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
            console.error(err);
            throw new InternalServerErrorException('Failed to send message');
        }
    }
}
