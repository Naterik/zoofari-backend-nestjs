import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryRunner } from "typeorm";
import { Order } from "./entities/order.entity";
import { Payment } from "../payments/entities/payment.entity";
import { TransactionHistory } from "../transaction_history/entities/transaction_history.entity";
import { User } from "../users/entities/user.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { UpdateOrderDto } from "./dto/update-order.dto";
import { OrderDetail } from "../order.detail/entities/order.detail.entity";
import { Product } from "../products/entities/product.entity";
import { ProductItems } from "../product.items/entities/product.item.entity";
import { ProductItemOptions } from "../product.item.options/entities/product.item.option.entity";
import { PaginateQuery } from "nestjs-paginate";
import { MailerService } from "@nestjs-modules/mailer";
import { format, toZonedTime } from "date-fns-tz";
import { vi } from "date-fns/locale";
import * as paypal from "@paypal/checkout-server-sdk";

@Injectable()
export class OrdersService {
  private paypalClient: paypal.core.PayPalHttpClient;

  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(TransactionHistory)
    private transactionHistoryRepository: Repository<TransactionHistory>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(OrderDetail)
    private orderDetailsRepository: Repository<OrderDetail>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductItems)
    private productItemsRepository: Repository<ProductItems>,
    @InjectRepository(ProductItemOptions)
    private productItemOptionsRepository: Repository<ProductItemOptions>,
    private readonly mailerService: MailerService
  ) {
    const environment = new paypal.core.SandboxEnvironment(
      process.env.PAYPAL_CLIENT_ID,
      process.env.PAYPAL_CLIENT_SECRET
    );
    this.paypalClient = new paypal.core.PayPalHttpClient(environment);
  }

  private async runTransaction<T>(
    fn: (queryRunner: QueryRunner) => Promise<T>
  ): Promise<T> {
    const queryRunner =
      this.ordersRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const result = await fn(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw e;
    } finally {
      await queryRunner.release();
    }
  }

  // Hardcode tỷ giá VND sang USD (cho mục đích demo). Trong thực tế, bạn nên lấy từ API.
  private readonly exchangeRateVNDToUSD = 0.000041; // 1 VND = 0.000041 USD (tỷ giá giả định)

  private convertVNDToUSD(amountVND: number): string {
    const amountUSD = (amountVND * this.exchangeRateVNDToUSD).toFixed(2); // Làm tròn 2 chữ số thập phân
    return amountUSD;
  }

  async create(createOrderDto: CreateOrderDto): Promise<any> {
    return this.runTransaction(async (queryRunner) => {
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

      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user)
        throw new NotFoundException(`User with id ${userId} not found`);

      const order = queryRunner.manager.create(Order, {
        user,
        total_amount: 0,
        status: "Pending",
      });
      const savedOrder = await queryRunner.manager.save(order);

      let totalAmount = 0;
      const createdDetails: OrderDetail[] = [];
      for (const detail of orderDetails) {
        const { productId, productItemId, productItemOptionId, quantity } =
          detail;

        const product = await queryRunner.manager.findOne(Product, {
          where: { id: productId },
        });
        if (!product)
          throw new NotFoundException(`Product with id ${productId} not found`);
        if (product.stock < quantity)
          throw new BadRequestException(
            `Product with id ${productId} does not have enough stock`
          );

        const productItem = await queryRunner.manager.findOne(ProductItems, {
          where: { id: productItemId },
        });
        if (!productItem)
          throw new NotFoundException(
            `Product item with id ${productItemId} not found`
          );
        if (productItem.stock < quantity)
          throw new BadRequestException(
            `Product item with id ${productItemId} does not have enough stock`
          );

        let productItemOption: ProductItemOptions | null = null;
        let optionPrice = 0;
        if (productItemOptionId) {
          productItemOption = await queryRunner.manager.findOne(
            ProductItemOptions,
            { where: { id: productItemOptionId } }
          );
          if (!productItemOption)
            throw new NotFoundException(
              `Option with id ${productItemOptionId} not found`
            );
          optionPrice = Number(productItemOption.additionPrice);
        }

        const basePrice = Number(productItem.basePrice);
        const finalPrice = Number((basePrice + optionPrice).toFixed(2));

        product.stock -= quantity;
        productItem.stock -= quantity;
        await queryRunner.manager.save(product);
        await queryRunner.manager.save(productItem);

        const orderDetailData: Partial<OrderDetail> = {
          order: savedOrder,
          product,
          productItem,
          productItemOption: productItemOption ?? undefined,
          quantity,
          price: finalPrice,
        };
        const orderDetail = queryRunner.manager.create(
          OrderDetail,
          orderDetailData
        );
        const savedDetail = await queryRunner.manager.save(orderDetail);

        totalAmount += savedDetail.price * savedDetail.quantity;
        createdDetails.push(savedDetail);
      }

      savedOrder.total_amount = totalAmount;
      await queryRunner.manager.save(savedOrder);

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order: savedOrder,
          action: "Order Created",
          amount: totalAmount,
          notes: "Order created with status Pending",
        }
      );
      await queryRunner.manager.save(transactionHistory);

      const vietnamTimeZone = "Asia/Ho_Chi_Minh";
      const zonedDate = toZonedTime(savedOrder.order_date, vietnamTimeZone);
      const formattedDate = format(zonedDate, "dd/MM/yyyy, EEEE, HH:mm:ss", {
        locale: vi,
      });

      await this.mailerService.sendMail({
        to: "khuonglol12@gmail.com",
        subject: "New Order Created",
        text: `A new order has been created with ID: ${savedOrder.id}`,
        template: "new-order",
        context: {
          orderId: savedOrder.id,
          userName: user.name,
          totalAmount,
          orderDate: formattedDate,
        },
      });

      return {
        id: savedOrder.id,
        totalAmount,
        message: "Order created successfully",
        orderDetails: createdDetails,
      };
    });
  }

  async findAll(query: PaginateQuery & { userId?: number }): Promise<any> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;
    const userId = query.userId;

    const queryBuilder = this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.orderDetails", "orderDetails")
      .leftJoinAndSelect("orderDetails.product", "product")
      .leftJoinAndSelect("orderDetails.productItem", "productItem")
      .leftJoinAndSelect("orderDetails.productItemOption", "productItemOption")
      .leftJoinAndSelect("order.payments", "payments")
      .leftJoinAndSelect("order.transactionHistories", "transactionHistories")
      .select([
        "order.id",
        "order.order_date",
        "order.total_amount",
        "order.status",
        "user.id",
        "user.name",
        "orderDetails.id",
        "orderDetails.quantity",
        "orderDetails.price",
        "product.id",
        "product.name",
        "productItem.id",
        "productItem.title",
        "productItemOption.id",
        "productItemOption.title",
        "payments.id",
        "payments.method",
        "payments.status",
        "payments.amount",
        "transactionHistories.id",
        "transactionHistories.action",
        "transactionHistories.amount",
        "transactionHistories.timestamp",
      ])
      .skip(skip)
      .take(limit)
      .orderBy("order.id", "DESC");

    if (userId) {
      queryBuilder.andWhere("order.user.id = :userId", { userId });
    }

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: { orders },
      meta: {
        totalItems: total,
        itemCount: orders.length,
        itemsPerPage: +limit,
        totalPages: Math.ceil(total / limit),
        currentPage: +page,
      },
    };
  }

  async findOne(id: number): Promise<Order> {
    const order = await this.ordersRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.orderDetails", "orderDetails")
      .leftJoinAndSelect("orderDetails.product", "product")
      .leftJoinAndSelect("orderDetails.productItem", "productItem")
      .leftJoinAndSelect("orderDetails.productItemOption", "productItemOption")
      .leftJoinAndSelect("order.payments", "payments")
      .leftJoinAndSelect("order.transactionHistories", "transactionHistories")
      .where("order.id = :id", { id })
      .getOne();

    if (!order) throw new NotFoundException(`Order with id ${id} not found`);
    return order;
  }

  async update(id: number, updateOrderDto: UpdateOrderDto): Promise<any> {
    return this.runTransaction(async (queryRunner) => {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: [
          "user",
          "orderDetails",
          "orderDetails.product",
          "orderDetails.productItem",
        ],
      });
      if (!order) throw new NotFoundException(`Order with id ${id} not found`);

      const { userId, orderDetails, status } = updateOrderDto;

      let user: User = order.user;
      if (userId) {
        const foundUser = await queryRunner.manager.findOne(User, {
          where: { id: userId },
        });
        if (!foundUser)
          throw new NotFoundException(`User with id ${userId} not found`);
        user = foundUser;
      }

      if (status === "Completed") {
        for (const detail of order.orderDetails) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: detail.product.id },
          });
          const productItem = await queryRunner.manager.findOne(ProductItems, {
            where: { id: detail.productItem.id },
          });
          if (
            !product ||
            !productItem ||
            product.stock < detail.quantity ||
            productItem.stock < detail.quantity
          ) {
            throw new BadRequestException(
              `Insufficient stock for product ${detail.product.id} or product item ${detail.productItem.id}`
            );
          }
        }
      }

      if (orderDetails && orderDetails.length > 0) {
        for (const detail of order.orderDetails) {
          const product = await queryRunner.manager.findOne(Product, {
            where: { id: detail.product.id },
          });
          const productItem = await queryRunner.manager.findOne(ProductItems, {
            where: { id: detail.productItem.id },
          });
          if (product) {
            product.stock += detail.quantity;
          }
          if (productItem) {
            productItem.stock += detail.quantity;
          }
          await queryRunner.manager.save(product);
          await queryRunner.manager.save(productItem);
        }
        await queryRunner.manager.delete(OrderDetail, { order: { id } });

        let totalAmount = 0;
        const newDetails: OrderDetail[] = [];
        for (const detail of orderDetails) {
          const { productId, productItemId, productItemOptionId, quantity } =
            detail;

          const product = await queryRunner.manager.findOne(Product, {
            where: { id: productId },
          });
          if (!product)
            throw new NotFoundException(
              `Product with id ${productId} not found`
            );
          if (product.stock < quantity)
            throw new BadRequestException(
              `Product with id ${productId} does not have enough stock`
            );

          const productItem = await queryRunner.manager.findOne(ProductItems, {
            where: { id: productItemId },
          });
          if (!productItem)
            throw new NotFoundException(
              `Product item with id ${productItemId} not found`
            );
          if (productItem.stock < quantity)
            throw new BadRequestException(
              `Product item with id ${productItemId} does not have enough stock`
            );

          let productItemOption: ProductItemOptions | null = null;
          let optionPrice = 0;
          if (productItemOptionId) {
            productItemOption = await queryRunner.manager.findOne(
              ProductItemOptions,
              { where: { id: productItemOptionId } }
            );
            if (!productItemOption)
              throw new NotFoundException(
                `Option with id ${productItemOptionId} not found`
              );
            optionPrice = Number(productItemOption.additionPrice);
          }

          const basePrice = Number(productItem.basePrice);
          const finalPrice = Number((basePrice + optionPrice).toFixed(2));

          product.stock -= quantity;
          productItem.stock -= quantity;
          await queryRunner.manager.save(product);
          await queryRunner.manager.save(productItem);

          const orderDetail = queryRunner.manager.create(OrderDetail, {
            order,
            product,
            productItem,
            productItemOption: productItemOption ?? undefined,
            quantity,
            price: finalPrice,
          });
          const savedDetail = await queryRunner.manager.save(orderDetail);
          totalAmount += savedDetail.price * savedDetail.quantity;
          newDetails.push(savedDetail);
        }

        order.total_amount = totalAmount;
        order.orderDetails = newDetails;
      }

      order.status = status || order.status;
      order.user = user;
      await queryRunner.manager.save(order);

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order,
          action: `Order Updated to ${order.status}`,
          amount: order.total_amount,
          notes: `Order status updated to ${order.status}`,
        }
      );
      await queryRunner.manager.save(transactionHistory);

      const updatedOrder = await this.findOne(id);
      return {
        message: "Order updated successfully",
        order: updatedOrder,
      };
    });
  }

  async remove(id: number): Promise<any> {
    return this.runTransaction(async (queryRunner) => {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id },
        relations: [
          "orderDetails",
          "orderDetails.product",
          "orderDetails.productItem",
        ],
      });
      if (!order) throw new NotFoundException(`Order with id ${id} not found`);

      for (const detail of order.orderDetails) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: detail.product.id },
        });
        if (!product)
          throw new NotFoundException(
            `Product with id ${detail.product.id} not found`
          );
        const productItem = await queryRunner.manager.findOne(ProductItems, {
          where: { id: detail.productItem.id },
        });
        if (!productItem)
          throw new NotFoundException(
            `Product item with id ${detail.productItem.id} not found`
          );
        product.stock += detail.quantity;
        productItem.stock += detail.quantity;
        await queryRunner.manager.save(product);
        await queryRunner.manager.save(productItem);
      }

      await queryRunner.manager.delete(OrderDetail, { order: { id } });
      const result = await queryRunner.manager.delete(Order, id);

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order,
          action: "Order Cancelled",
          amount: order.total_amount,
          notes: "Order deleted by user or system",
        }
      );
      await queryRunner.manager.save(transactionHistory);

      return {
        message: "Order deleted successfully",
        affected: result.affected,
      };
    });
  }

  async processPayment(
    orderId: number,
    paymentData: { method: string; transactionId?: string }
  ): Promise<any> {
    return this.runTransaction(async (queryRunner) => {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: [
          "user",
          "orderDetails",
          "orderDetails.product",
          "orderDetails.productItem",
        ],
      });
      if (!order)
        throw new NotFoundException(`Order with id ${orderId} not found`);
      if (order.status !== "Pending" && order.status !== "Processing") {
        throw new BadRequestException(
          `Order with id ${orderId} cannot be paid in its current status: ${order.status}`
        );
      }

      const payment = queryRunner.manager.create(Payment, {
        order,
        method: paymentData.method,
        status: "Success",
        amount: order.total_amount,
        transactionId: paymentData.transactionId ?? undefined,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      order.status = "Paid";
      await queryRunner.manager.save(order);

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order,
          payment: savedPayment,
          action: "Payment Success",
          amount: order.total_amount,
          notes: `Payment successful via ${paymentData.method}`,
        }
      );
      await queryRunner.manager.save(transactionHistory);

      const vietnamTimeZone = "Asia/Ho_Chi_Minh";
      const zonedDate = toZonedTime(new Date(), vietnamTimeZone);
      const formattedDate = format(zonedDate, "dd/MM/yyyy, EEEE, HH:mm:ss", {
        locale: vi,
      });

      await this.mailerService.sendMail({
        to: order.user.email,
        subject: "Payment Successful",
        text: `Your payment for order ${order.id} has been successful.`,
        template: "payment-success",
        context: {
          orderId: order.id,
          totalAmount: order.total_amount,
          paymentDate: formattedDate,
        },
      });

      if (paymentData.method === "COD") {
        order.status = "Processing";
        await queryRunner.manager.save(order);
        const codTransaction = queryRunner.manager.create(TransactionHistory, {
          order,
          payment: savedPayment,
          action: "Order Processing",
          amount: order.total_amount,
          notes: "Order moved to Processing for COD",
        });
        await queryRunner.manager.save(codTransaction);
      }

      return {
        message: "Payment processed successfully",
        payment: savedPayment,
        orderStatus: order.status,
      };
    });
  }

  async createPaypalSession(orderId: number) {
    const order = await this.findOne(orderId);
    if (!order)
      throw new NotFoundException(`Order with id ${orderId} not found`);
    if (order.status !== "Pending")
      throw new BadRequestException(
        `Order with id ${orderId} is not in Pending status`
      );

    const amountUSD = this.convertVNDToUSD(order.total_amount); // Chuyển đổi từ VND sang USD

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: "USD", // PayPal chỉ hỗ trợ USD, không hỗ trợ VND
            value: amountUSD,
          },
          reference_id: orderId.toString(),
          description: `Payment for order #${orderId} (VND ${order.total_amount.toLocaleString("vi-VN")})`,
        },
      ],
      application_context: {
        return_url: "http://127.0.0.1:4040/api/orders/paypal/success",
        cancel_url: "http://127.0.0.1:4040/api/orders/paypal/cancel",
      },
    });

    const response = await this.paypalClient.execute(request);
    const approvalUrl = response.result.links.find(
      (link: any) => link.rel === "approve"
    ).href;
    return { approvalUrl };
  }

  async capturePaypalPayment(token: string, payerId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(token);
    const response = await this.paypalClient.execute(request);

    if (response.result.status !== "COMPLETED") {
      throw new BadRequestException("Payment failed");
    }

    const orderId = parseInt(
      response.result.purchase_units[0].reference_id,
      10
    );
    const transactionId = response.result.id;

    return this.runTransaction(async (queryRunner) => {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ["user"],
      });
      if (!order)
        throw new NotFoundException(`Order with id ${orderId} not found`);

      const existingPayment = await queryRunner.manager.findOne(Payment, {
        where: { transactionId },
      });
      if (existingPayment) {
        return { message: "Payment already processed", orderId, transactionId };
      }

      order.status = "Paid";
      await queryRunner.manager.save(order);

      const payment = queryRunner.manager.create(Payment, {
        order,
        method: "PayPal",
        status: "Success",
        amount: order.total_amount,
        transactionId,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      // Kiểm tra xem purchase_units và amount có tồn tại không
      const amountUSD =
        response.result.purchase_units?.[0]?.amount?.value ?? "N/A";

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order,
          payment: savedPayment,
          action: "Payment Success",
          amount: order.total_amount,
          notes: `Payment successful via PayPal (USD ${amountUSD})`,
        }
      );
      await queryRunner.manager.save(transactionHistory);

      const vietnamTimeZone = "Asia/Ho_Chi_Minh";
      const zonedDate = toZonedTime(new Date(), vietnamTimeZone);
      const formattedDate = format(zonedDate, "dd/MM/yyyy, EEEE, HH:mm:ss", {
        locale: vi,
      });

      await this.mailerService.sendMail({
        to: order.user.email,
        subject: "Payment Successful",
        text: `Your payment for order ${order.id} has been successful.`,
        template: "payment-success",
        context: {
          orderId: order.id,
          totalAmount: order.total_amount.toLocaleString("vi-VN"),
          paymentDate: formattedDate,
        },
      });

      return { message: "Payment successful", orderId, transactionId };
    });
  }

  async cancelPaypalPayment(token: string) {
    // Lấy thông tin order từ token
    const request = new paypal.orders.OrdersGetRequest(token);
    const response = await this.paypalClient.execute(request);

    const orderId = parseInt(
      response.result.purchase_units[0].reference_id,
      10
    );

    return this.runTransaction(async (queryRunner) => {
      const order = await queryRunner.manager.findOne(Order, {
        where: { id: orderId },
        relations: ["user"],
      });
      if (!order)
        throw new NotFoundException(`Order with id ${orderId} not found`);

      // Kiểm tra trạng thái order để tránh cập nhật không cần thiết
      if (order.status !== "Pending") {
        return { message: "Order already processed", orderId };
      }

      order.status = "Cancelled";
      await queryRunner.manager.save(order);

      const transactionHistory = queryRunner.manager.create(
        TransactionHistory,
        {
          order,
          action: "Payment Cancelled",
          amount: order.total_amount,
          notes: "Payment cancelled by user on PayPal",
        }
      );
      await queryRunner.manager.save(transactionHistory);

      const vietnamTimeZone = "Asia/Ho_Chi_Minh";
      const zonedDate = toZonedTime(new Date(), vietnamTimeZone);
      const formattedDate = format(zonedDate, "dd/MM/yyyy, EEEE, HH:mm:ss", {
        locale: vi,
      });

      await this.mailerService.sendMail({
        to: order.user.email,
        subject: "Payment Cancelled",
        text: `Your payment for order ${order.id} has been cancelled.`,
        template: "payment-cancelled",
        context: {
          orderId: order.id,
          totalAmount: order.total_amount.toLocaleString("vi-VN"),
          cancelDate: formattedDate,
        },
      });

      return { message: "Payment cancelled", orderId };
    });
  }
}
