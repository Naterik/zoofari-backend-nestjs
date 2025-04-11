import { Type } from "class-transformer";
import { IsNumber, Min, IsIn } from "class-validator";

export class SortByPriceDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number;

  @IsIn(["asc", "desc"])
  sortByPrice: "asc" | "desc";
}
