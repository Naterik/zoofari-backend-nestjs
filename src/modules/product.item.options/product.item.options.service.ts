import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ProductItemOptions } from "./entities/product.item.option.entity";
import { CreateProductItemOptionDto } from "./dto/create-product.item.option.dto";

@Injectable()
export class ProductItemOptionsService {
  constructor(
    @InjectRepository(ProductItemOptions)
    private readonly productItemOptionsRepository: Repository<ProductItemOptions>
  ) {}

  async create(createProductItemOptionDto: CreateProductItemOptionDto) {
    const productItemOption = this.productItemOptionsRepository.create(
      createProductItemOptionDto
    );
    return await this.productItemOptionsRepository.save(productItemOption);
  }

  async findByProductItemId(
    productItemId: number
  ): Promise<ProductItemOptions[]> {
    const options = await this.productItemOptionsRepository.find({
      where: { productItem: { id: productItemId } },
    });
    if (!options.length)
      throw new NotFoundException(
        `No options found for product item with id ${productItemId}`
      );
    return options;
  }
}
