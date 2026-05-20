import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CorporateController, CorporateAdminController } from './corporate.controller';
import { CorporateService } from './corporate.service';

@Module({
  imports: [AuthModule],
  controllers: [CorporateController, CorporateAdminController],
  providers: [CorporateService],
  exports: [CorporateService],
})
export class CorporateModule {}
