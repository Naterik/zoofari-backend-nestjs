import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { Product } from "./entities/product.entity";
import { Animal } from "../animals/entities/animal.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Product, Animal, ProductItems])],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
