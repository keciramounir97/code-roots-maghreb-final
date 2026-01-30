import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { NewsletterController } from './newsletter.controller';
import { MailerModule } from '../../common/mailer/mailer.module';

@Module({
    imports: [MailerModule],
    controllers: [ContactController, NewsletterController],
})
export class ContactModule { }
