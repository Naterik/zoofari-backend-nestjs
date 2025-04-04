import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
} from "class-validator";

export class CreateAnimalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  species_id: number;

  @IsNumber()
  @IsNotEmpty()
  enclosure_id: number;

  @IsDateString()
  @IsOptional()
  birth_date?: string;

  @IsEnum(["Male", "Female", "Unknown"])
  @IsOptional()
  gender?: string;

  @IsString()
  @IsNotEmpty()
  health_status: string;
}
