import { Module } from "@nestjs/common";
import { ProductItemOptionsService } from "./product.item.options.service";
import { ProductItemOptionsController } from "./product.item.options.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductItemOptions } from "./entities/product.item.option.entity";

@Module({
  imports: [TypeOrmModule.forFeature([ProductItemOptions])],
  controllers: [ProductItemOptionsController],
  providers: [ProductItemOptionsService],
  exports: [ProductItemOptionsService],
})
export class ProductItemOptionsModule {}
