import { PartialType } from "@nestjs/mapped-types";
import { CreateAnimalDto } from "./create-animal.dto";
import { IsOptional, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UpdateAnimalDto extends PartialType(CreateAnimalDto) {
  @IsOptional()
  files: Array<Express.Multer.File>;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  replaceImages?: boolean;
}
