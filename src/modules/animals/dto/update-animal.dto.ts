import { IsOptional, IsEnum, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class UpdateAnimalDto {
  @IsOptional()
  @IsString({ message: "Tên động vật phải là chuỗi" })
  name?: string;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  ) // Chuyển đổi từ chuỗi sang số
  species_id?: number;

  @IsOptional()
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  ) // Chuyển đổi từ chuỗi sang số
  enclosure_id?: number;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birth_date?: Date;

  @IsOptional()
  @IsEnum(["Male", "Female", "Unknown"], {
    message: "Giới tính phải là Male, Female, hoặc Unknown",
  })
  gender?: string;

  @IsOptional()
  @IsString({ message: "Tình trạng sức khỏe phải là chuỗi" })
  health_status?: string;

  // New fields with validation
  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  description?: string;

  @IsOptional()
  @IsString({ message: "Hình dáng phải là chuỗi" })
  appearance?: string;

  @IsOptional()
  @IsString({ message: "Hành vi phải là chuỗi" })
  behavior?: string;

  @IsOptional()
  files?: Array<Express.Multer.File>;
}
