import { Module } from '@nestjs/common';
import { TicketSalesService } from './ticket.sales.service';
import { TicketSalesController } from './ticket.sales.controller';

@Module({
  controllers: [TicketSalesController],
  providers: [TicketSalesService],
})
export class TicketSalesModule {}
