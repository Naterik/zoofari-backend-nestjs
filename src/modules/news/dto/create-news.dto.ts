import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  content?: string;
}
