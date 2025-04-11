import { IsNotEmpty, IsOptional, IsEnum, IsString } from "class-validator";
import { Transform } from "class-transformer";

export class CreateAnimalDto {
  @IsNotEmpty({ message: "Tên động vật không được để trống" })
  @IsString({ message: "Tên động vật phải là chuỗi" })
  name: string;

  @IsNotEmpty({ message: "Loài không được để trống" })
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  ) // Chuyển đổi từ chuỗi sang số
  species_id: number;

  @IsNotEmpty({ message: "Chuồng không được để trống" })
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  ) // Chuyển đổi từ chuỗi sang số
  enclosure_id: number;

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : null))
  birth_date?: Date;

  @IsEnum(["Male", "Female", "Unknown"], {
    message: "Giới tính phải là Male, Female, hoặc Unknown",
  })
  @IsOptional()
  gender?: string;

  @IsNotEmpty({ message: "Tình trạng sức khỏe không được để trống" })
  @IsString({ message: "Tình trạng sức khỏe phải là chuỗi" })
  health_status: string;

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
  files?: Array<Express.Multer.File>; // Đánh dấu là optional vì files được xử lý riêng qua FilesInterceptor
}
