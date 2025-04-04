import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator";

export class UpdateAnimalDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  species_id?: number;

  @IsNumber()
  @IsOptional()
  enclosure_id?: number;

  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @IsEnum(["Male", "Female", "Unknown"])
  @IsOptional()
  gender?: string;

  @IsString()
  @IsOptional()
  health_status?: string;
}
