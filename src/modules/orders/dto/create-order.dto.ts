import { IsInt, IsArray, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderDetailDto } from "src/modules/order.detail/dto/create-order.detail.dto";

export class CreateOrderDto {
  @IsInt()
  userId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  orderDetails: CreateOrderDetailDto[];
}
