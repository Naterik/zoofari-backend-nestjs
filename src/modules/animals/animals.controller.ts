import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { AnimalsService } from "./animals.service";
import { CreateAnimalDto } from "./dto/create-animal.dto";
import { UpdateAnimalDto } from "./dto/update-animal.dto";
import { PaginateQuery } from "nestjs-paginate";
import { Animal } from "./entities/animal.entity";

@Controller("animals")
export class AnimalsController {
  constructor(private readonly animalsService: AnimalsService) {}

  @Post()
  create(@Body() createAnimalDto: CreateAnimalDto) {
    return this.animalsService.create(createAnimalDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.animalsService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.animalsService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateAnimalDto: UpdateAnimalDto) {
    return this.animalsService.update(+id, updateAnimalDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.animalsService.remove(+id);
  }
}
