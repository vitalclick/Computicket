import { Global, Module } from '@nestjs/common';
import { MailerService } from './mailer.service';
import { SmsService } from './sms.service';

@Global()
@Module({
  providers: [MailerService, SmsService],
  exports: [MailerService, SmsService],
})
export class MailModule {}
