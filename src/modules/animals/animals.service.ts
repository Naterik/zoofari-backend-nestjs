import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
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
    @InjectRepository(Animal) private animalsRepository: Repository<Animal>,
    @InjectRepository(Species) private speciesRepository: Repository<Species>,
    @InjectRepository(Enclosure)
    private enclosuresRepository: Repository<Enclosure>,
    private imagesService: ImagesService,
    private configService: ConfigService
  ) {}

  async create(
    createAnimalDto: CreateAnimalDto,
    files: Array<Express.Multer.File> = []
  ) {
    const queryRunner =
      this.animalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { species_id, enclosure_id, birth_date, ...animalData } =
        createAnimalDto;

      if (!animalData.name) {
        throw new BadRequestException("Tên động vật không được để trống");
      }

      const species = await queryRunner.manager.findOne(Species, {
        where: { id: species_id },
      });
      if (!species)
        throw new NotFoundException(
          `Species với id ${species_id} không tồn tại`
        );

      const enclosure = await queryRunner.manager.findOne(Enclosure, {
        where: { id: enclosure_id },
      });
      if (!enclosure)
        throw new NotFoundException(
          `Enclosure với id ${enclosure_id} không tồn tại`
        );

      const animal = queryRunner.manager.create(Animal, {
        ...animalData,
        species,
        enclosure,
        birth_date: birth_date ? dayjs(birth_date).toDate() : undefined,
      });

      const savedAnimal = await queryRunner.manager.save(animal);

      if (files.length > 0) {
        const appUrl = this.configService.get<string>("APP_URL");
        for (const file of files) {
          const fileUrl = `${appUrl}/uploads/${file.filename}`;
          await this.imagesService.createForAnimal(
            savedAnimal.id,
            {
              url: fileUrl,
              description: file.originalname,
            },
            queryRunner
          );
        }
      }

      await queryRunner.commitTransaction();
      return { id: savedAnimal.id, message: "Tạo animal thành công" };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(
        `Có lỗi xảy ra khi tạo animal: ${e.message}`
      );
    } finally {
      await queryRunner.release();
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
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
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
      .leftJoinAndSelect("animal.images", "images")
      .where("animal.id = :id", { id })
      .getOne();

    if (!animal) {
      throw new NotFoundException(`Animal với id ${id} không tồn tại`);
    }

    return animal;
  }

  async findOneWithDetails(id: number) {
    try {
      const animal = await this.animalsRepository
        .createQueryBuilder("animal")
        .leftJoinAndSelect("animal.species", "species")
        .leftJoinAndSelect("animal.enclosure", "enclosure")
        .leftJoinAndSelect("animal.images", "images")
        .where("animal.id = :id", { id })
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
          "species.scientific_name",
          "species.description",
          "species.conservation_status",
          "enclosure.id",
          "enclosure.name",
          "enclosure.location",
          "enclosure.capacity",
          "images.id",
          "images.url",
          "images.description",
        ])
        .getOne();

      if (!animal) {
        throw new NotFoundException(`Animal với id ${id} không tồn tại`);
      }

      return animal;
    } catch (error) {
      console.error("Error in findOneWithDetails:", error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException("Failed to fetch animal details");
    }
  }

  async update(id: number, updateAnimalDto: UpdateAnimalDto) {
    const queryRunner =
      this.animalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const animal = await queryRunner.manager.findOne(Animal, {
        where: { id },
        relations: ["species", "enclosure"],
      });
      if (!animal)
        throw new NotFoundException(`Animal với id ${id} không tồn tại`);

      const { species_id, enclosure_id, birth_date, files, ...rest } =
        updateAnimalDto;
      const updateData: Partial<Animal> & {
        species?: Species;
        enclosure?: Enclosure;
      } = { ...rest };

      if (species_id) {
        const species = await queryRunner.manager.findOne(Species, {
          where: { id: species_id },
        });
        if (!species)
          throw new NotFoundException(
            `Species với id ${species_id} không tồn tại`
          );
        updateData.species = species;
      }

      if (enclosure_id) {
        const enclosure = await queryRunner.manager.findOne(Enclosure, {
          where: { id: enclosure_id },
        });
        if (!enclosure)
          throw new NotFoundException(
            `Enclosure với id ${enclosure_id} không tồn tại`
          );
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

      await queryRunner.manager.save(Animal, {
        ...animal,
        ...updateAnimalData,
      });

      // Chỉ thêm ảnh mới nếu có, không can thiệp vào ảnh cũ
      if (files && files.length > 0) {
        const appUrl = this.configService.get<string>("APP_URL");
        for (const file of files) {
          const fileUrl = `${appUrl}/uploads/${file.filename}`;
          await this.imagesService.createForAnimal(
            id,
            {
              url: fileUrl,
              description: file.originalname,
            },
            queryRunner
          );
        }
      }

      await queryRunner.commitTransaction();
      const updatedAnimal = await this.findOne(id);
      return { message: "Cập nhật thành công", animal: updatedAnimal };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error("Error updating animal:", e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật animal");
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
    const queryRunner =
      this.animalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await queryRunner.manager.delete(Animal, id);
      if (result.affected === 0)
        throw new BadRequestException("Xóa animal thất bại");
      await queryRunner.commitTransaction();
      return { message: "Xóa animal thành công", affected: result.affected };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      console.error("Error deleting animal:", e);
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async getAnimalImages(animalId: number) {
    await this.findOne(animalId);
    return await this.imagesService.findByAnimalId(animalId);
  }

  async addImageToAnimal(animalId: number, files: Array<Express.Multer.File>) {
    const queryRunner =
      this.animalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.findOne(animalId);
      const appUrl = this.configService.get<string>("APP_URL");
      const imagePromises = files.map((file) => {
        const fileUrl = `${appUrl}/uploads/${file.filename}`;
        return this.imagesService.createForAnimal(
          animalId,
          {
            url: fileUrl,
            description: file.originalname,
          },
          queryRunner
        );
      });
      await Promise.all(imagePromises);
      await queryRunner.commitTransaction();
      return { message: "Images added to animal successfully" };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  async removeAnimalImage(animalId: number, imageId: number) {
    const queryRunner =
      this.animalsRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await this.findOne(animalId);
      const images = await this.imagesService.findByAnimalId(
        animalId,
        queryRunner
      );
      const imageToRemove = images.find((img) => img.id === imageId);
      if (!imageToRemove) {
        throw new NotFoundException(
          `Image with id ${imageId} not found for animal ${animalId}`
        );
      }
      await this.imagesService.remove(imageId, queryRunner);
      await queryRunner.commitTransaction();
      return { message: "Image removed from animal successfully" };
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }
}
