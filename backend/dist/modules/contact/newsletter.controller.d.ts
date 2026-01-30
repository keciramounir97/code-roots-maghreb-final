import { MailerService } from '../../common/mailer/mailer.service';
import { ConfigService } from '@nestjs/config';
export declare class NewsletterController {
    private readonly mailerService;
    private readonly configService;
    constructor(mailerService: MailerService, configService: ConfigService);
    subscribe(body: {
        email: string;
    }): Promise<{
        message: string;
    }>;
}
