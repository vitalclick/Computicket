import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AddOnsController, PublicAddOnsController } from './add-ons.controller';
import { AddOnsService } from './add-ons.service';

@Module({
  imports: [AuthModule],
  controllers: [AddOnsController, PublicAddOnsController],
  providers: [AddOnsService],
  exports: [AddOnsService],
})
export class AddOnsModule {}
