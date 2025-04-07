import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { ProductItems } from "src/modules/product.items/entities/product.item.entity";
import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";

@Entity("product_item_options")
export class ProductItemOptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column("decimal", {
    precision: 10,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  additionPrice: number;

  @Column({ length: 255 })
  optionDescription: string;

  @ManyToOne(
    () => ProductItems,
    (productItem) => productItem.productItemOptions
  )
  productItem: ProductItems;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.productItemOption)
  orderDetails: OrderDetail[];
}
