import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order } from "./entities/order.entity";
import { User } from "../users/entities/user.entity";
import { OrderDetailService } from "../order.detail/order.detail.service";
import { CreateOrderDto } from "./dto/create-order.dto";
import { OrderDetail } from "../order.detail/entities/order.detail.entity";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private orderDetailService: OrderDetailService
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    // Check if createOrderDto is undefined or invalid
    if (
      !createOrderDto ||
      !createOrderDto.userId ||
      !createOrderDto.orderDetails
    ) {
      throw new BadRequestException(
        "Invalid order data: userId and orderDetails are required"
      );
    }

    const { userId, orderDetails } = createOrderDto;

    // Validate user
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User with id ${userId} not found`);

    // Create the order
    const order = this.ordersRepository.create({
      user,
      total_amount: 0,
      status: "Pending",
    });
    const savedOrder = await this.ordersRepository.save(order);

    // Create order details and calculate total amount
    let totalAmount = 0;
    const createdDetails: OrderDetail[] = [];
    for (const detail of orderDetails) {
      const orderDetail = { ...detail, orderId: savedOrder.id };
      const createdDetail = await this.orderDetailService.create(orderDetail);
      totalAmount += createdDetail.price * createdDetail.quantity;
      createdDetails.push(createdDetail);
    }

    // Update the order with the total amount
    savedOrder.total_amount = totalAmount;
    await this.ordersRepository.save(savedOrder);

    return {
      id: savedOrder.id,
      totalAmount,
      message: "Order created successfully",
      orderDetails: createdDetails,
    };
  }

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: [
        "user",
        "orderDetails",
        "orderDetails.product",
        "orderDetails.productItem",
        "orderDetails.productItemOption",
      ],
    });
  }
}
