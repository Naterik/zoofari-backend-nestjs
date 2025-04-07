import { IsString, IsNumber, IsNotEmpty, IsOptional } from "class-validator";
import { Type } from "class-transformer";

export class CreateProductItemDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  basePrice: number;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  stock: number;

  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  productId: number;

  @IsOptional()
  files?: Array<Express.Multer.File>;
}
