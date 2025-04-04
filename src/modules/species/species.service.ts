import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Species } from "./entities/species.entity";
import { CreateSpeciesDto } from "./dto/create-species.dto";
import { UpdateSpeciesDto } from "./dto/update-species.dto";
import { PaginateQuery } from "nestjs-paginate";

@Injectable()
export class SpeciesService {
  constructor(
    @InjectRepository(Species)
    private speciesRepository: Repository<Species>
  ) {}

  async create(createSpeciesDto: CreateSpeciesDto) {
    try {
      const { name, scientific_name, description, conservation_status } =
        createSpeciesDto;

      const species = this.speciesRepository.create({
        name,
        scientific_name,
        description,
        conservation_status,
      });

      const savedSpecies = await this.speciesRepository.save(species);
      return {
        id: savedSpecies.id,
        message: "Tạo species thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo species");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [species, total] = await this.speciesRepository.findAndCount({
        skip,
        take: limit,
        order: { id: "DESC" },
        select: [
          "id",
          "name",
          "scientific_name",
          "description",
          "conservation_status",
        ],
      });

      return {
        data: species,
        meta: {
          totalItems: total,
          itemCount: species.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch species");
    }
  }

  async findOne(id: number) {
    const species = await this.speciesRepository.findOne({
      where: { id },
    });
    if (!species) {
      throw new NotFoundException(`Species với id ${id} không tồn tại`);
    }
    return species;
  }

  async update(id: number, updateSpeciesDto: UpdateSpeciesDto) {
    try {
      const species = await this.findOne(id);

      const updateData: Partial<Species> = {
        name: updateSpeciesDto.name ?? species.name,
        scientific_name:
          updateSpeciesDto.scientific_name ?? species.scientific_name,
        description: updateSpeciesDto.description ?? species.description,
        conservation_status:
          updateSpeciesDto.conservation_status ?? species.conservation_status,
      };

      await this.speciesRepository.save({ ...species, ...updateData });
      const updatedSpecies = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        species: updatedSpecies,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật species");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.speciesRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa species thất bại");
      }
      return {
        message: "Xóa species thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }
}
