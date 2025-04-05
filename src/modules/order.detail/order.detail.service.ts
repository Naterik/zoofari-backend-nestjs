import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OrderDetail } from "./entities/order.detail.entity";
import { Order } from "../orders/entities/order.entity";
import { Product } from "../products/entities/product.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";
import { CreateOrderDetailDto } from "./dto/create-order.detail.dto";

@Injectable()
export class OrderDetailService {
  constructor(
    @InjectRepository(OrderDetail)
    private orderDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductItems)
    private productItemsRepository: Repository<ProductItems>,
    @InjectRepository(ProductItemOptions)
    private productItemOptionsRepository: Repository<ProductItemOptions>
  ) {}

  async create(
    createOrderDetailDto: CreateOrderDetailDto
  ): Promise<OrderDetail> {
    const { orderId, productId, productItemId, productItemOptionId, quantity } =
      createOrderDetailDto;

    // Validate order if provided
    let order: Order | null = null;
    if (orderId) {
      order = await this.ordersRepository.findOne({ where: { id: orderId } });
      if (!order)
        throw new NotFoundException(`Order with id ${orderId} not found`);
    }

    // Validate product
    const product = await this.productsRepository.findOne({
      where: { id: productId },
    });
    if (!product)
      throw new NotFoundException(`Product with id ${productId} not found`);

    // Validate product item
    const productItem = await this.productItemsRepository.findOne({
      where: { id: productItemId },
    });
    if (!productItem)
      throw new NotFoundException(
        `Product item with id ${productItemId} not found`
      );

    // Validate product item option if provided
    let productItemOption: ProductItemOptions | null = null;
    let optionPrice = 0;
    if (productItemOptionId) {
      productItemOption = await this.productItemOptionsRepository.findOne({
        where: { id: productItemOptionId },
      });
      if (!productItemOption)
        throw new NotFoundException(
          `Option with id ${productItemOptionId} not found`
        );
      optionPrice = Number(productItemOption.additionPrice); // Convert to number
    }

    // Calculate final price
    const basePrice = Number(productItem.basePrice); // Convert to number
    const finalPrice = basePrice + optionPrice;

    // Create the order detail entity
    const orderDetail = new OrderDetail();
    if (order) {
      orderDetail.order = order;
    }
    orderDetail.product = product;
    orderDetail.productItem = productItem;
    if (productItemOption) {
      orderDetail.productItemOption = productItemOption;
    }
    orderDetail.quantity = quantity;
    orderDetail.price = Number(finalPrice.toFixed(2)); // Ensure 2 decimal places

    // Save and return the order detail
    return await this.orderDetailsRepository.save(orderDetail);
  }
}
