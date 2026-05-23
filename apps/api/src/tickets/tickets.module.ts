import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SeatingModule } from '../seating/seating.module';
import { TicketTransfersService } from './ticket-transfers.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  imports: [AuthModule, SeatingModule],
  controllers: [TicketsController],
  providers: [TicketsService, TicketTransfersService],
  exports: [TicketsService],
})
export class TicketsModule {}
