import { IsInt, IsOptional, Min } from "class-validator";

export class CreateOrderDetailDto {
  @IsInt()
  productId: number;

  @IsInt()
  productItemId: number;

  @IsInt()
  @IsOptional()
  productItemOptionId?: number;

  @IsInt()
  @Min(1)
  quantity: number;

  @IsInt()
  @IsOptional()
  orderId?: number;
}
