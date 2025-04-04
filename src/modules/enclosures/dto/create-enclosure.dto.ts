import { IsString, IsNotEmpty, IsNumber } from "class-validator";

export class CreateEnclosureDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsNumber()
  @IsNotEmpty()
  capacity: number;
}
