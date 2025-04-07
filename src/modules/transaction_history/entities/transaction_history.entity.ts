import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { Order } from "src/modules/orders/entities/order.entity";
import { Payment } from "src/modules/payments/entities/payment.entity";

@Entity("transaction_history")
export class TransactionHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.transactionHistories, {
    onDelete: "CASCADE",
  })
  order: Order;

  @ManyToOne(() => Payment, (payment) => payment.transactionHistories, {
    nullable: true,
    onDelete: "SET NULL",
  })
  payment: Payment;

  @Column({ type: "varchar", length: 100, nullable: false })
  action: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  amount: number;

  @CreateDateColumn({ type: "datetime", name: "timestamp" })
  timestamp: Date;

  @Column({ type: "text", nullable: true })
  notes: string;
}
