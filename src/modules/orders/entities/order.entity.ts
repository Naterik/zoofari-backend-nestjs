import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  order_date: Date;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_amount: number;

  @Column({
    type: "enum",
    enum: ["Pending", "Completed", "Cancelled"],
    default: "Pending",
  })
  status: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];
}
