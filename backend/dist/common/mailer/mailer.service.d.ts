import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
export declare class MailerService {
    private configService;
    private transporter;
    constructor(configService: ConfigService);
    sendMail(options: nodemailer.SendMailOptions): Promise<any>;
}
