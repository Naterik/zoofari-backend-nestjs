import { IsNotEmpty, IsOptional, IsEnum } from "class-validator";
import { Transform } from "class-transformer";

export class CreateAnimalDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  species_id: number;

  @IsNotEmpty()
  enclosure_id: number;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birth_date?: Date;

  @IsEnum(["Male", "Female", "Unknown"], {
    message: "Gender must be Male, Female, or Unknown",
  })
  @IsOptional()
  gender?: string;

  @IsNotEmpty()
  health_status: string;

  @IsOptional()
  file?: Express.Multer.File; // Trường file để upload ảnh
}
