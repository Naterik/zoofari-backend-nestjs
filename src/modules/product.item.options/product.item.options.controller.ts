import { Controller, Get, Post, Body, Param } from "@nestjs/common";
import { ProductItemOptionsService } from "./product.item.options.service";
import { CreateProductItemOptionDto } from "./dto/create-product.item.option.dto";

@Controller("product-item-options")
export class ProductItemOptionsController {
  constructor(
    private readonly productItemOptionsService: ProductItemOptionsService
  ) {}

  @Post()
  create(@Body() createProductItemOptionDto: CreateProductItemOptionDto) {
    return this.productItemOptionsService.create(createProductItemOptionDto);
  }

  @Get("/items/:id/options")
  async getProductOptions(@Param("id") productItemId: number) {
    return this.productItemOptionsService.findByProductItemId(productItemId);
  }
}
