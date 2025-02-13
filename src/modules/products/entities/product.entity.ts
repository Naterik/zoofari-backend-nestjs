import Animals from 'src/modules/animals/entities/animal.entity';
import { Images } from 'src/modules/images/entities/image.entity';
import { ProductItems } from 'src/modules/product.items/entities/product.item.entity';
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
