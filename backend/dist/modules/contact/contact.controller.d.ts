import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
import { ContactDto } from './dto/contact.dto';
export declare class ContactController {
    private readonly mailerService;
    private readonly configService;
    constructor(mailerService: MailerService, configService: ConfigService);
    sendContact(body: ContactDto): Promise<{
        message: string;
    }>;
}
