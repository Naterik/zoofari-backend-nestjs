import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProductItemOptionsService } from './product.item.options.service';
import { CreateProductItemOptionDto } from './dto/create-product.item.option.dto';
import { UpdateProductItemOptionDto } from './dto/update-product.item.option.dto';

@Controller('product.item.options')
export class ProductItemOptionsController {
  constructor(private readonly productItemOptionsService: ProductItemOptionsService) {}

  @Post()
  create(@Body() createProductItemOptionDto: CreateProductItemOptionDto) {
    return this.productItemOptionsService.create(createProductItemOptionDto);
  }

  @Get()
  findAll() {
    return this.productItemOptionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productItemOptionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductItemOptionDto: UpdateProductItemOptionDto) {
    return this.productItemOptionsService.update(+id, updateProductItemOptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productItemOptionsService.remove(+id);
  }
}
