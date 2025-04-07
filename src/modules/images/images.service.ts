import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
import { Image } from "./entities/image.entity";
import { CreateImageDto } from "./dto/create-image.dto";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image) private imagesRepository: Repository<Image>
  ) {}

  async createForAnimal(
    animalId: number,
    createImageDto: CreateImageDto,
    queryRunner?: QueryRunner
  ): Promise<Image> {
    const image = queryRunner
      ? queryRunner.manager.create(Image, {
          ...createImageDto,
          animal_id: animalId,
        })
      : this.imagesRepository.create({
          ...createImageDto,
          animal_id: animalId,
        });
    return queryRunner
      ? queryRunner.manager.save(image)
      : this.imagesRepository.save(image);
  }

  async createForProductItem(
    productItemId: number,
    createImageDto: CreateImageDto,
    queryRunner?: QueryRunner
  ): Promise<Image> {
    const image = queryRunner
      ? queryRunner.manager.create(Image, {
          ...createImageDto,
          product_item_id: productItemId,
        })
      : this.imagesRepository.create({
          ...createImageDto,
          product_item_id: productItemId,
        });
    return queryRunner
      ? queryRunner.manager.save(image)
      : this.imagesRepository.save(image);
  }

  async findByAnimalId(
    animalId: number,
    queryRunner?: QueryRunner
  ): Promise<Image[]> {
    return queryRunner
      ? queryRunner.manager.find(Image, { where: { animal_id: animalId } })
      : this.imagesRepository.find({ where: { animal_id: animalId } });
  }

  async findByProductItemId(
    productItemId: number,
    queryRunner?: QueryRunner
  ): Promise<Image[]> {
    return queryRunner
      ? queryRunner.manager.find(Image, {
          where: { product_item_id: productItemId },
        })
      : this.imagesRepository.find({
          where: { product_item_id: productItemId },
        });
  }

  async remove(imageId: number, queryRunner?: QueryRunner): Promise<void> {
    const result = queryRunner
      ? await queryRunner.manager.delete(Image, imageId)
      : await this.imagesRepository.delete(imageId);
    if (result.affected === 0) {
      throw new NotFoundException(`Image with id ${imageId} not found`);
    }
  }
}
