import { IsArray, IsNumber, IsOptional, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class ByProductDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsArray()
  @Type(() => Number)
  productIds: number[];
}
