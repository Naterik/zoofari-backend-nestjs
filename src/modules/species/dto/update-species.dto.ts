import { IsOptional, IsEnum, IsString } from "class-validator";

export class UpdateSpeciesDto {
  @IsOptional()
  @IsString({ message: "Tên loài phải là chuỗi" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Tên khoa học phải là chuỗi" })
  scientific_name?: string;

  @IsOptional()
  @IsString({ message: "Mô tả phải là chuỗi" })
  description?: string;

  @IsOptional()
  @IsEnum(["Endangered", "Vulnerable", "Least Concern", "Not Evaluated"], {
    message:
      "Tình trạng bảo tồn phải là Endangered, Vulnerable, Least Concern, hoặc Not Evaluated",
  })
  conservation_status?:
    | "Endangered"
    | "Vulnerable"
    | "Least Concern"
    | "Not Evaluated";

  // New fields with validation
  @IsOptional()
  @IsString({ message: "Chế độ ăn phải là chuỗi" })
  diet?: string;

  @IsOptional()
  @IsString({ message: "Môi trường sống phải là chuỗi" })
  habitat?: string;

  @IsOptional()
  @IsString({ message: "Họ loài phải là chuỗi" })
  family?: string;
}
