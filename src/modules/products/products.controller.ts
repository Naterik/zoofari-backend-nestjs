import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PaginateQuery, Paginated } from "nestjs-paginate";
import { Product } from "./entities/product.entity";

@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(
    @Body() createProductDto: CreateProductDto
  ): Promise<{ id: number; message: string }> {
    return this.productsService.create(createProductDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery): Promise<Paginated<Product>> {
    return this.productsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string): Promise<Product> {
    return this.productsService.findOne(+id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto
  ): Promise<{ message: string; product: Product }> {
    return this.productsService.update(+id, updateProductDto);
  }

  @Delete(":id")
  remove(
    @Param("id") id: string
  ): Promise<{ message: string; affected: number }> {
    return this.productsService.remove(+id);
  }
}
