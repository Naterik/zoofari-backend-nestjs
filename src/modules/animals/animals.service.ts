import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Animal } from "./entities/animal.entity";
import { CreateAnimalDto } from "./dto/create-animal.dto";
import { UpdateAnimalDto } from "./dto/update-animal.dto";
import { Species } from "../species/entities/species.entity";
import { Enclosure } from "../enclosures/entities/enclosure.entity";
import { PaginateQuery } from "nestjs-paginate";
import dayjs from "dayjs";
import { ImagesService } from "../images/images.service";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AnimalsService {
  constructor(
    @InjectRepository(Animal)
    private animalsRepository: Repository<Animal>,
    @InjectRepository(Species)
    private speciesRepository: Repository<Species>,
    @InjectRepository(Enclosure)
    private enclosuresRepository: Repository<Enclosure>,
    private imagesService: ImagesService,
    private configService: ConfigService
  ) {}

  async create(createAnimalDto: CreateAnimalDto) {
    try {
      const { species_id, enclosure_id, birth_date, file, ...animalData } =
        createAnimalDto;

      const species = await this.speciesRepository.findOne({
        where: { id: species_id },
      });
      if (!species) {
        throw new NotFoundException(
          `Species với id ${species_id} không tồn tại`
        );
      }

      const enclosure = await this.enclosuresRepository.findOne({
        where: { id: enclosure_id },
      });
      if (!enclosure) {
        throw new NotFoundException(
          `Enclosure với id ${enclosure_id} không tồn tại`
        );
      }

      const animal = this.animalsRepository.create({
        ...animalData,
        species,
        enclosure,
        birth_date: birth_date ? dayjs(birth_date).toDate() : undefined,
      });

      const savedAnimal = await this.animalsRepository.save(animal);

      // Xử lý upload ảnh nếu có file
      if (file) {
        const appUrl = this.configService.get<string>("APP_URL");
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        await this.imagesService.createForAnimal(savedAnimal.id, {
          url: fileUrl,
          description: file.originalname,
        });
      }

      return {
        id: savedAnimal.id,
        message: "Tạo animal thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo animal");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [animals, total] = await this.animalsRepository
        .createQueryBuilder("animal")
        .leftJoinAndSelect("animal.species", "species")
        .leftJoinAndSelect("animal.enclosure", "enclosure")
        .leftJoinAndSelect("animal.images", "images")
        .select([
          "animal.id",
          "animal.name",
          "animal.birth_date",
          "animal.gender",
          "animal.health_status",
          "animal.created_at",
          "animal.updated_at",
          "species.id",
          "species.name",
          "enclosure.id",
          "enclosure.name",
          "images.id",
          "images.url",
          "images.description",
        ])
        .skip(skip)
        .take(limit)
        .orderBy("animal.id", "DESC")
        .getManyAndCount();

      return {
        data: animals,
        meta: {
          totalItems: total,
          itemCount: animals.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch animals");
    }
  }

  async findOne(id: number) {
    const animal = await this.animalsRepository
      .createQueryBuilder("animal")
      .leftJoinAndSelect("animal.species", "species")
      .leftJoinAndSelect("animal.enclosure", "enclosure")
      .leftJoinAndSelect("animal.products", "products")
      .leftJoinAndSelect("animal.images", "images")
      .where("animal.id = :id", { id })
      .getOne();

    if (!animal) {
      throw new NotFoundException(`Animal với id ${id} không tồn tại`);
    }

    return animal;
  }

  async update(id: number, updateAnimalDto: UpdateAnimalDto) {
    try {
      const animal = await this.animalsRepository.findOne({
        where: { id },
        relations: ["species", "enclosure"],
      });
      if (!animal) {
        throw new NotFoundException(`Animal với id ${id} không tồn tại`);
      }

      const {
        species_id,
        enclosure_id,
        birth_date,
        file,
        replaceImages,
        ...rest
      } = updateAnimalDto;
      const updateData: Partial<Animal> & {
        species?: Species;
        enclosure?: Enclosure;
      } = { ...rest };

      if (species_id) {
        const species = await this.speciesRepository.findOne({
          where: { id: species_id },
        });
        if (!species) {
          throw new NotFoundException(
            `Species với id ${species_id} không tồn tại`
          );
        }
        updateData.species = species;
      }

      if (enclosure_id) {
        const enclosure = await this.enclosuresRepository.findOne({
          where: { id: enclosure_id },
        });
        if (!enclosure) {
          throw new NotFoundException(
            `Enclosure với id ${enclosure_id} không tồn tại`
          );
        }
        updateData.enclosure = enclosure;
      }

      const updateAnimalData: Partial<Animal> = {
        name: updateData.name ?? animal.name,
        birth_date: birth_date ? dayjs(birth_date).toDate() : animal.birth_date,
        gender: updateData.gender ?? animal.gender,
        health_status: updateData.health_status ?? animal.health_status,
        species: updateData.species ?? animal.species,
        enclosure: updateData.enclosure ?? animal.enclosure,
      };

      await this.animalsRepository.save({ ...animal, ...updateAnimalData });

      // Xử lý upload ảnh nếu có file
      if (file) {
        // Nếu replaceImages = true, xóa ảnh cũ trước khi thêm ảnh mới
        if (replaceImages) {
          const existingImages = await this.imagesService.findByAnimalId(id);
          for (const image of existingImages) {
            await this.imagesService.remove(image.id);
          }
        }

        // Thêm ảnh mới
        const appUrl = this.configService.get<string>("APP_URL");
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        await this.imagesService.createForAnimal(id, {
          url: fileUrl,
          description: file.originalname,
        });
      }

      const updatedAnimal = await this.findOne(id);
      return {
        message: "Cập nhật thành công",
        animal: updatedAnimal,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật animal");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.animalsRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa animal thất bại");
      }
      // Images will be automatically deleted due to ON DELETE CASCADE in the images table
      return {
        message: "Xóa animal thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }

  async getAnimalImages(animalId: number) {
    await this.findOne(animalId);
    return await this.imagesService.findByAnimalId(animalId);
  }

  async addImageToAnimal(animalId: number, file: Express.Multer.File) {
    await this.findOne(animalId);
    const appUrl = this.configService.get<string>("APP_URL");
    const fileUrl = `${appUrl}/uploads/${file.filename}`;
    const image = await this.imagesService.createForAnimal(animalId, {
      url: fileUrl,
      description: file.originalname,
    });
    return { message: "Image added to animal successfully", image };
  }

  async removeAnimalImage(animalId: number, imageId: number) {
    await this.findOne(animalId);
    const images = await this.imagesService.findByAnimalId(animalId);
    const imageToRemove = images.find((img) => img.id === imageId);
    if (!imageToRemove) {
      throw new NotFoundException(
        `Image with id ${imageId} not found for animal ${animalId}`
      );
    }
    await this.imagesService.remove(imageId);
    return { message: "Image removed from animal successfully" };
  }
}
