import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Order } from "src/modules/orders/entities/order.entity";
import { ProductItems } from "src/modules/product.items/entities/product.item.entity";
import { ProductItemOptions } from "src/modules/product.item.options/entities/product.item.option.entity";
import { Product } from "src/modules/products/entities/product.entity";

@Entity("order_details")
export class OrderDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.orderDetails)
  @JoinColumn({ name: "order_id" })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderDetails)
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => ProductItems, (productItem) => productItem.orderDetails)
  @JoinColumn({ name: "product_item_id" })
  productItem: ProductItems;

  @ManyToOne(() => ProductItemOptions, (option) => option.orderDetails)
  @JoinColumn({ name: "product_item_option_id" })
  productItemOption: ProductItemOptions;

  @Column()
  quantity: number;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  price: number;
}
