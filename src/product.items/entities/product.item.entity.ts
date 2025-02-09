import { OrderDetails } from 'src/order.detail/entities/order.detail.entity';
import { ProductItemOptions } from 'src/product.item.options/entities/product.item.option.entity';
import Products from 'src/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Images } from 'src/images/entities/image.entity';

@Entity()
export class ProductItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titile: string;

  @Column('decimal', { precision: 10, scale: 2 })
  basePrice: number;

  @Column()
  decription: string;

  @ManyToOne(() => Images, (images) => images.productItems)
  image: Images;

  @ManyToOne(() => Products, (product) => product.productItems)
  product: Products;

  @OneToMany(
    () => ProductItemOptions,
    (productItemOptions) => productItemOptions.productItem,
  )
  productItemOptions: ProductItemOptions;
  @OneToMany(
    () => OrderDetails,
    (orderDetails) => orderDetails.productItemOption,
  )
  orderDetails: OrderDetails[];
}
