import {
  IsInt,
  IsArray,
  ValidateNested,
  IsOptional,
  IsEnum,
} from "class-validator";
import { Type } from "class-transformer";
import { CreateOrderDetailDto } from "src/modules/order.detail/dto/create-order.detail.dto";

export enum OrderStatus {
  PENDING = "Pending",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export class UpdateOrderDto {
  @IsInt()
  @IsOptional()
  userId?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderDetailDto)
  @IsOptional()
  orderDetails?: CreateOrderDetailDto[];

  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;
}
