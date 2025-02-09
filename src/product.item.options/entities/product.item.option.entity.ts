import { Images } from 'src/images/entities/image.entity';
import { OrderDetails } from 'src/order.detail/entities/order.detail.entity';
import { ProductItems } from 'src/product.items/entities/product.item.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
export class ProductItemOptions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  titile: string;

  @Column('decimal', { precision: 10, scale: 2 })
  additionPrice: number;

  @Column()
  optionDecription: string;

  @ManyToOne(
    () => ProductItems,
    (productItem) => productItem.productItemOptions,
  )
  productItem: ProductItems[];

  @OneToMany(
    () => OrderDetails,
    (orderDetails) => orderDetails.productItemOption,
  )
  orderDetails: OrderDetails[];
}
