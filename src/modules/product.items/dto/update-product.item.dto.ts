import { IsString, IsNumber, IsOptional, IsBoolean } from "class-validator";
import { Type } from "class-transformer";

export class UpdateProductItemDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  basePrice?: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  productId?: number;
  @IsOptional()
  files?: Array<Express.Multer.File>;

  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  replaceImages?: boolean;
}
