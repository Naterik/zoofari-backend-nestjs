import { Injectable } from '@nestjs/common';
import { CreateProductItemOptionDto } from './dto/create-product.item.option.dto';
import { UpdateProductItemOptionDto } from './dto/update-product.item.option.dto';

@Injectable()
export class ProductItemOptionsService {
  create(createProductItemOptionDto: CreateProductItemOptionDto) {
    return 'This action adds a new productItemOption';
  }

  findAll() {
    return `This action returns all productItemOptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} productItemOption`;
  }

  update(id: number, updateProductItemOptionDto: UpdateProductItemOptionDto) {
    return `This action updates a #${id} productItemOption`;
  }

  remove(id: number) {
    return `This action removes a #${id} productItemOption`;
  }
}
