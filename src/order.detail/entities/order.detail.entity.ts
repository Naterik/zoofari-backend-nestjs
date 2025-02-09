import { Orders } from 'src/orders/entities/order.entity';
import { ProductItemOptions } from 'src/product.item.options/entities/product.item.option.entity';
import { ProductItems } from 'src/product.items/entities/product.item.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class OrderDetails {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Orders, (orders) => orders.orderDetails)
  order: Orders;

  @ManyToOne(() => ProductItems, (productItems) => productItems.orderDetails)
  productItem: ProductItems;

  @ManyToOne(
    () => ProductItemOptions,
    (productItemOptions) => productItemOptions.orderDetails,
  )
  productItemOption: ProductItemOptions;
}
