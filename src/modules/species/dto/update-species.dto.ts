import { IsString, IsOptional, IsEnum } from "class-validator";

export class UpdateSpeciesDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  scientific_name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(["Endangered", "Vulnerable", "Least Concern", "Not Evaluated"])
  @IsOptional()
  conservation_status?: string;
}
