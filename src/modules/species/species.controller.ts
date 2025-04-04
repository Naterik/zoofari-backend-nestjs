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
import { SpeciesService } from "./species.service";
import { CreateSpeciesDto } from "./dto/create-species.dto";
import { UpdateSpeciesDto } from "./dto/update-species.dto";
import { PaginateQuery } from "nestjs-paginate";
import { Species } from "./entities/species.entity";

@Controller("species")
export class SpeciesController {
  constructor(private readonly speciesService: SpeciesService) {}

  @Post()
  create(@Body() createSpeciesDto: CreateSpeciesDto) {
    return this.speciesService.create(createSpeciesDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery) {
    return this.speciesService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.speciesService.findOne(+id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSpeciesDto: UpdateSpeciesDto) {
    return this.speciesService.update(+id, updateSpeciesDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.speciesService.remove(+id);
  }
}
