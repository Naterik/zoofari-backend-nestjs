import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateProductItemOptionDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsNumber()
  additionPrice: number;

  @IsNotEmpty()
  @IsString()
  optionDescription: string;

  @IsNotEmpty()
  @IsNumber()
  productItemId: number;
}
