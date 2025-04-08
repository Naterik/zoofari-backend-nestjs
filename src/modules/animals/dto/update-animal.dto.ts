import { PartialType } from "@nestjs/mapped-types";
import { CreateAnimalDto } from "./create-animal.dto";
import { IsOptional } from "class-validator";

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @IsOptional()
  files: Array<Express.Multer.File>;
}
