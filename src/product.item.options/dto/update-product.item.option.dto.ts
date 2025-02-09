import { PartialType } from '@nestjs/mapped-types';
import { CreateProductItemOptionDto } from './create-product.item.option.dto';

export class UpdateProductItemOptionDto extends PartialType(CreateProductItemOptionDto) {}
