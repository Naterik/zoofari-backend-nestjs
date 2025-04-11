import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateNewsDto {
  @IsNotEmpty({ message: "Tiêu đề không được để trống" })
  @IsString({ message: "Tiêu đề phải là chuỗi" })
  title: string;

  @IsOptional()
  @IsString({ message: "Nội dung phải là chuỗi" })
  content?: string;

  @IsOptional()
  file?: Express.Multer.File;
}
