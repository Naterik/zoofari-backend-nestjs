import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersController } from "./orders.controller";
import { Order } from "./entities/order.entity";
import { User } from "../users/entities/user.entity";
import { OrderDetailModule } from "../order.detail/order.detail.module";

@Module({
  imports: [TypeOrmModule.forFeature([Order, User]), OrderDetailModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
