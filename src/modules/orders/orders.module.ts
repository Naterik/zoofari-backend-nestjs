import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { Payment } from "../payments/entities/payment.entity";
import { TransactionHistory } from "../transaction_history/entities/transaction_history.entity";
import { OrderDetail } from "../order.detail/entities/order.detail.entity";
import { User } from "../users/entities/user.entity";
import { Product } from "../products/entities/product.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";
import { MailerModule } from "@nestjs-modules/mailer";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Payment,
      TransactionHistory,
      OrderDetail,
      User,
      Product,
      ProductItems,
      ProductItemOptions,
    ]),
    MailerModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
