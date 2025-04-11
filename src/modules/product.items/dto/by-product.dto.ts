import { Type, Transform } from "class-transformer";
import { IsInt, IsNumber, Min } from "class-validator";

export class ByProductDto {
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit: number;

  @Transform(({ value }) => {
    // Handle comma-separated string (e.g., "1,2") or array of values
    if (typeof value === "string") {
      return value.split(",").map((v: string) => parseInt(v.trim(), 10));
    }
    const values = Array.isArray(value) ? value : [value];
    return values.map((v: string) => parseInt(v, 10));
  })
  @IsInt({ each: true })
  productIds: number[];
}
