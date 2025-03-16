import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EnclosuresService } from './enclosures.service';
import { CreateEnclosureDto } from './dto/create-enclosure.dto';
import { UpdateEnclosureDto } from './dto/update-enclosure.dto';

@Controller('enclosures')
export class EnclosuresController {
  constructor(private readonly enclosuresService: EnclosuresService) {}

  @Post()
  create(@Body() createEnclosureDto: CreateEnclosureDto) {
    return this.enclosuresService.create(createEnclosureDto);
  }

  @Get()
  findAll() {
    return this.enclosuresService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.enclosuresService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEnclosureDto: UpdateEnclosureDto) {
    return this.enclosuresService.update(+id, updateEnclosureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.enclosuresService.remove(+id);
  }
}
