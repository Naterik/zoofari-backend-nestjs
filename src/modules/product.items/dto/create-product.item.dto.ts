import { IsString, IsNumber, IsNotEmpty, IsOptional } from "class-validator";
import { Transform } from "class-transformer";

export class CreateProductItemDto {
  @IsString()
  @IsNotEmpty({ message: "Tiêu đề không được để trống" })
  title: string;

  @IsNumber()
  @IsNotEmpty({ message: "Giá cơ bản không được để trống" })
  @Transform(({ value }) =>
    typeof value === "string" ? parseFloat(value) : value
  )
  basePrice: number;

  @IsString()
  @IsNotEmpty({ message: "Mô tả không được để trống" })
  description: string;

  @IsString()
  @IsNotEmpty({ message: "Mã sản phẩm không được để trống" })
  code: string;

  @IsNumber()
  @IsNotEmpty({ message: "Số lượng tồn kho không được để trống" })
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  )
  stock: number;

  @IsNumber()
  @IsNotEmpty({ message: "Sản phẩm không được để trống" })
  @Transform(({ value }) =>
    typeof value === "string" ? parseInt(value, 10) : value
  )
  productId: number;

  @IsOptional()
  files?: Array<Express.Multer.File>;
}
