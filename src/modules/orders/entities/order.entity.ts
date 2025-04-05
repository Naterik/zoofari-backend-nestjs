import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from "typeorm";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: "user_id" })
  user: User;

  @CreateDateColumn({ type: "datetime", name: "order_date" })
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
