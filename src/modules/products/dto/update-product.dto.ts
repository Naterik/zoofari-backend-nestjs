import { IsString, IsOptional, IsEnum, IsNumber } from "class-validator";

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  stock?: number;

  @IsEnum(["Available", "OutOfStock", "Discontinued"])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsOptional()
  animal_id?: number;
}
