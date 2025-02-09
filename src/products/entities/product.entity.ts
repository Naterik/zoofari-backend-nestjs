import Animals from 'src/animals/entities/animal.entity';
import { Images } from 'src/images/entities/image.entity';
import { ProductItems } from 'src/product.items/entities/product.item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
class Products {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  name!: string;
  @Column()
  description!: string;
  @ManyToOne(() => Animals, (animals) => animals.products)
  animal: Animals;
  @ManyToOne(() => Images, (images) => images.products)
  image: Images;
  @OneToMany(() => ProductItems, (productItem) => productItem.product)
  productItems: ProductItems;
}

export default Products;
