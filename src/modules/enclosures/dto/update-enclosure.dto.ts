import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateEnclosureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  capacity?: number;
}
