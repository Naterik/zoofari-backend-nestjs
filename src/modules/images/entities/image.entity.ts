import { ProductItems } from 'src/modules/product.items/entities/product.item.entity';
import Products from 'src/modules/products/entities/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Images {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  url!: string;
  @Column()
  decription?: string;
  @OneToMany(() => ProductItems, (productItems) => productItems.image)
  productItems: ProductItems[];
  @OneToMany(() => Products, (products) => products.image)
  products: Products[];
}
