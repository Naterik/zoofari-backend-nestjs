import { Orders } from 'src/modules/orders/entities/order.entity';
import { ProductItemOptions } from 'src/modules/product.item.options/entities/product.item.option.entity';
import { ProductItems } from 'src/modules/product.items/entities/product.item.entity';
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
