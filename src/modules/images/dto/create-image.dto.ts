import { IsOptional, IsString } from "class-validator";

export class CreateImageDto {
  @IsString()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;
}
