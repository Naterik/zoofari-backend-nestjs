import { Module } from '@nestjs/common';
import { ProductItemOptionsService } from './product.item.options.service';
import { ProductItemOptionsController } from './product.item.options.controller';

@Module({
  controllers: [ProductItemOptionsController],
  providers: [ProductItemOptionsService],
})
export class ProductItemOptionsModule {}
