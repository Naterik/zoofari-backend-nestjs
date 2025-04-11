import { IsOptional, IsString } from "class-validator";

export class UpdateNewsDto {
  @IsOptional()
  @IsString({ message: "Tiêu đề phải là chuỗi" })
  title?: string;

  @IsOptional()
  @IsString({ message: "Nội dung phải là chuỗi" })
  content?: string;

  // File upload field (optional)
  @IsOptional()
  file?: Express.Multer.File;
}
