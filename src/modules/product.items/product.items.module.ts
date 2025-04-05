import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductItemsService } from "./product.items.service";
import { ProductItemsController } from "./product.items.controller";
import { Product } from "../products/entities/product.entity";
import { ConfigModule } from "@nestjs/config";
import { ImagesModule } from "../images/images.module";
import { ProductItems } from "./entities/product.item.entity";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductItems, Product, ProductItemOptions]),
    ConfigModule,
    ImagesModule,
  ],
  providers: [ProductItemsService],
  controllers: [ProductItemsController],
  exports: [ProductItemsService],
})
export class ProductItemsModule {}
