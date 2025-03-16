import { Injectable } from '@nestjs/common';
import { CreateEnclosureDto } from './dto/create-enclosure.dto';
import { UpdateEnclosureDto } from './dto/update-enclosure.dto';

@Injectable()
export class EnclosuresService {
  create(createEnclosureDto: CreateEnclosureDto) {
    return 'This action adds a new enclosure';
  }

  findAll() {
    return `This action returns all enclosures`;
  }

  findOne(id: number) {
    return `This action returns a #${id} enclosure`;
  }

  update(id: number, updateEnclosureDto: UpdateEnclosureDto) {
    return `This action updates a #${id} enclosure`;
  }

  remove(id: number) {
    return `This action removes a #${id} enclosure`;
  }
}
