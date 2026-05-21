import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { StreamingController, StreamingDashboardController } from './streaming.controller';
import { StreamingService } from './streaming.service';

@Module({
  imports: [AuthModule],
  controllers: [StreamingController, StreamingDashboardController],
  providers: [StreamingService],
})
export class StreamingModule {}
