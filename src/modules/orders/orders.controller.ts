import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  BadRequestException,
} from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { PaginateQuery } from "nestjs-paginate";

@Controller("orders")
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  findAll(@Query() query: PaginateQuery & { userId?: number }) {
    return this.ordersService.findAll(query);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.ordersService.findOne(+id);
  }

  @Get(":id/details")
  findOrderDetail(@Param("id") id: string) {
    return this.ordersService.findOrderDetail(+id);
  }

  @Put(":id")
  update(@Param("id") id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(+id, updateOrderDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.ordersService.remove(+id);
  }
  @Put(":id/details/:detailId")
  updateOrderDetail(
    @Param("id") id: string,
    @Param("detailId") detailId: string,
    @Body() body: { quantity: number }
  ) {
    return this.ordersService.updateOrderDetail(+id, +detailId, body);
  }

  @Post(":id/pay")
  processPayment(
    @Param("id") id: string,
    @Body() paymentData: { method: string; transactionId?: string }
  ) {
    return this.ordersService.processPayment(+id, paymentData);
  }

  @Post(":id/create-paypal-session")
  async createPaypalSession(@Param("id") id: string) {
    return this.ordersService.createPaypalSession(+id);
  }

  @Get("paypal/success")
  async paypalSuccess(
    @Query("token") token: string,
    @Query("PayerID") payerId: string
  ) {
    if (!token || !payerId) {
      throw new BadRequestException("Missing token or PayerID");
    }
    const result = await this.ordersService.capturePaypalPayment(
      token,
      payerId
    );
    return {
      message: "Payment successful",
      orderId: result.orderId,
      transactionId: result.transactionId,
    };
  }

  @Get("paypal/cancel")
  async paypalCancel(@Query("token") token: string) {
    if (!token) {
      throw new BadRequestException("Missing token");
    }
    const result = await this.ordersService.cancelPaypalPayment(token);
    return {
      message: "Payment cancelled",
    };
  }
}
