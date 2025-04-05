import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Image } from "./entities/image.entity";
import { CreateImageDto } from "./dto/create-image.dto";

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>
  ) {}

  async createForAnimal(
    animalId: number,
    createImageDto: CreateImageDto
  ): Promise<Image> {
    const image = this.imagesRepository.create({
      ...createImageDto,
      animal_id: animalId,
    });
    return await this.imagesRepository.save(image);
  }

  async createForProductItem(
    productItemId: number,
    createImageDto: CreateImageDto
  ): Promise<Image> {
    const image = this.imagesRepository.create({
      ...createImageDto,
      product_item_id: productItemId,
    });
    return await this.imagesRepository.save(image);
  }

  async findByAnimalId(animalId: number): Promise<Image[]> {
    return this.imagesRepository.find({ where: { animal_id: animalId } });
  }

  async findByProductItemId(productItemId: number): Promise<Image[]> {
    return this.imagesRepository.find({
      where: { product_item_id: productItemId },
    });
  }
  async remove(imageId: number): Promise<void> {
    // Assuming you have an imagesRepository to handle database operations
    const result = await this.imagesRepository.delete(imageId);
    if (result.affected === 0) {
      throw new NotFoundException(`Image with id ${imageId} not found`);
    }
  }
}
