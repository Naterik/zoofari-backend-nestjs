import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrderDetailService } from "./order.detail.service";
import { OrderDetailController } from "./order.detail.controller";
import { OrderDetail } from "./entities/order.detail.entity";
import { Order } from "../orders/entities/order.entity";
import { Product } from "../products/entities/product.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OrderDetail,
      Order,
      Product,
      ProductItems,
      ProductItemOptions,
    ]),
  ],
  controllers: [OrderDetailController],
  providers: [OrderDetailService],
  exports: [OrderDetailService], // Export OrderDetailService so it can be used in other modules
})
export class OrderDetailModule {}
