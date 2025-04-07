import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Order } from "src/modules/orders/entities/order.entity";
import { TransactionHistory } from "src/modules/transaction_history/entities/transaction_history.entity";

@Entity("payments")
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.payments, { onDelete: "CASCADE" })
  order: Order;

  @Column({
    type: "enum",
    enum: ["COD", "PayPal", "BankTransfer"],
    nullable: false,
  })
  method: string;

  @Column({
    type: "enum",
    enum: ["Pending", "Success", "Failed"],
    default: "Pending",
    nullable: false,
  })
  status: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: false })
  amount: number;

  @Column({ type: "varchar", length: 255, nullable: true })
  transactionId: string;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updated_at: Date;
  @OneToMany(
    () => TransactionHistory,
    (transactionHistory) => transactionHistory.payment
  )
  transactionHistories: TransactionHistory[];
}
