import { OrderDetails } from 'src/modules/order.detail/entities/order.detail.entity';
import { ProductItemOptions } from 'src/modules/product.item.options/entities/product.item.option.entity';
import Products from 'src/modules/products/entities/product.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Images } from 'src/modules/images/entities/image.entity';

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
