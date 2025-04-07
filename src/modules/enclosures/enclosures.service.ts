import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Enclosure } from "./entities/enclosure.entity";
import { CreateEnclosureDto } from "./dto/create-enclosure.dto";
import { UpdateEnclosureDto } from "./dto/update-enclosure.dto";
import { PaginateQuery } from "nestjs-paginate";

@Injectable()
export class EnclosuresService {
  constructor(
    @InjectRepository(Enclosure)
    private enclosuresRepository: Repository<Enclosure>
  ) {}

  async create(createEnclosureDto: CreateEnclosureDto) {
    try {
      const { name, location, capacity } = createEnclosureDto;

      const enclosure = this.enclosuresRepository.create({
        name,
        location,
        capacity,
      });

      const savedEnclosure = await this.enclosuresRepository.save(enclosure);
      return {
        id: savedEnclosure.id,
        message: "Tạo enclosure thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo enclosure");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [enclosures, total] = await this.enclosuresRepository.findAndCount({
        skip,
        take: limit,
        order: { id: "DESC" },
        select: ["id", "name", "location", "capacity"],
      });

      return {
        data: enclosures,
        meta: {
          totalItems: total,
          itemCount: enclosures.length,
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch enclosures");
    }
  }

  async findOne(id: number) {
    const enclosure = await this.enclosuresRepository.findOne({
      where: { id },
    });
    if (!enclosure) {
      throw new NotFoundException(`Enclosure với id ${id} không tồn tại`);
    }
    return enclosure;
  }

  async update(id: number, updateEnclosureDto: UpdateEnclosureDto) {
    try {
      const enclosure = await this.findOne(id);

      const updateData: Partial<Enclosure> = {
        name: updateEnclosureDto.name ?? enclosure.name,
        location: updateEnclosureDto.location ?? enclosure.location,
        capacity: updateEnclosureDto.capacity ?? enclosure.capacity,
      };

      await this.enclosuresRepository.save({ ...enclosure, ...updateData });
      const updatedEnclosure = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        enclosure: updatedEnclosure,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật enclosure");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.enclosuresRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa enclosure thất bại");
      }
      return {
        message: "Xóa enclosure thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }
}
