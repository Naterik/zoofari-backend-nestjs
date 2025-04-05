import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Animal } from "../../animals/entities/animal.entity";
import { ProductItems } from "../../product.items/entities/product.item.entity";

@Entity("images")
export class Image {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  url: string;

  @Column({ length: 255, nullable: true })
  description: string;

  @CreateDateColumn({ type: "datetime" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime" })
  updated_at: Date;

  @Column({ nullable: true })
  animal_id: number;

  @Column({ nullable: true })
  product_item_id: number;

  @ManyToOne(() => Animal, (animal) => animal.images, { onDelete: "CASCADE" })
  @JoinColumn({ name: "animal_id" })
  animal: Animal;

  @ManyToOne(() => ProductItems, (productItem) => productItem.images, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "product_item_id" })
  productItem: ProductItems;
}
