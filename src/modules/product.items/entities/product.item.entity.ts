import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { Product } from "src/modules/products/entities/product.entity";
import { Image } from "src/modules/images/entities/image.entity";
import { ProductItemOptions } from "src/modules/product.item.options/entities/product.item.option.entity";
import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";

@Entity("product_items")
export class ProductItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  basePrice: number;

  @Column({ length: 255 })
  description: string;

  @Column({ length: 50, unique: true })
  code: string;

  @Column()
  stock: number;

  @ManyToOne(() => Product, (product) => product.productItems)
  product: Product;

  @OneToMany(() => Image, (image) => image.productItem)
  images: Image[];

  @OneToMany(() => ProductItemOptions, (option) => option.productItem)
  productItemOptions: ProductItemOptions[];

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.productItem)
  orderDetails: OrderDetail[];
}
