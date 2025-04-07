import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from "typeorm";
import { OrderDetail } from "src/modules/order.detail/entities/order.detail.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Payment } from "src/modules/payments/entities/payment.entity";
import { TransactionHistory } from "src/modules/transaction_history/entities/transaction_history.entity";

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
    enum: ["Pending", "Processing", "Paid", "Completed", "Cancelled"],
    default: "Pending",
  })
  status: string;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetails: OrderDetail[];

  @OneToMany(() => Payment, (payment) => payment.order)
  payments: Payment[];

  @OneToMany(
    () => TransactionHistory,
    (transactionHistory) => transactionHistory.order
  )
  transactionHistories: TransactionHistory[];
}
