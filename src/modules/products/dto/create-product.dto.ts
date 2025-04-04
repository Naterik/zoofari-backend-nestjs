import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
} from "class-validator";

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  stock: number;

  @IsEnum(["Available", "OutOfStock", "Discontinued"])
  @IsOptional()
  status?: string;

  @IsNumber()
  @IsNotEmpty()
  animal_id: number;
}
