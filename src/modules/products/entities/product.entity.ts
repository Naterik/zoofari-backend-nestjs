import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Animal } from "src/modules/animals/entities/animal.entity";
import { Image } from "src/modules/images/entities/image.entity";
import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";
import { ProductItems } from "src/modules/product.items/entities/product.item.entity";

@Entity("products")
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column()
  stock: number;

  @Column({
    type: "enum",
    enum: ["Available", "OutOfStock", "Discontinued"],
    default: "Available",
  })
  status: string;

  @ManyToOne(() => Animal, (animal) => animal.products)
  @JoinColumn({ name: "animal_id" })
  animal: Animal;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updated_at: Date;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.product)
  orderDetails: OrderDetail[];

  @OneToMany(() => ProductItems, (productItems) => productItems.product)
  productItems: ProductItems[];

  @OneToMany(() => Image, (image) => image.product)
  images: Image[];
}
