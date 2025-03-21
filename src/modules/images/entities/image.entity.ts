import { Animal } from "src/modules/animals/entities/animal.entity";
import { ProductItems } from "src/modules/product.items/entities/product.item.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Ticket } from "src/modules/tickets/entities/ticket.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  url: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @ManyToOne(() => Animal, (animal) => animal.images, { nullable: true })
  @JoinColumn({ name: "animal_id" })
  animal: Animal;

  @ManyToOne(() => Product, (product) => product.images, { nullable: true })
  @JoinColumn({ name: "product_id" })
  product: Product;

  @ManyToOne(() => ProductItems, (productItem) => productItem.images, {
    nullable: true,
  })
  @JoinColumn({ name: "product_item_id" })
  productItem: ProductItems;

  @ManyToOne(() => Ticket, (ticket) => ticket.images, { nullable: true })
  @JoinColumn({ name: "ticket_id" })
  ticket: Ticket;
}
