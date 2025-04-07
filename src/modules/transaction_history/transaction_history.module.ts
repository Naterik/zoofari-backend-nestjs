import { Module } from '@nestjs/common';
import { TransactionHistoryService } from './transaction_history.service';
import { TransactionHistoryController } from './transaction_history.controller';

@Module({
  controllers: [TransactionHistoryController],
  providers: [TransactionHistoryService],
})
export class TransactionHistoryModule {}
