import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from "typeorm";

import { Order } from "src/modules/orders/entities/order.entity";
import { TicketSale } from "src/modules/ticket.sales/entities/ticket.sale.entity";
import Roles from "src/modules/roles/entities/role.entity";

@Entity("users")
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({
    type: "enum",
    enum: ["Male", "Female", "Other"],
    nullable: true,
  })
  gender: string;

  @Column({ type: "timestamp", nullable: true })
  dateOfBirth: Date;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ default: false })
  isActive: boolean;

  @Column({
    type: "enum",
    enum: ["LOCAL", "GOOGLE", "FACEBOOK"],
    default: "LOCAL",
  })
  accountType: string;

  @Column({ length: 50, nullable: true })
  codeId: string;

  @Column({ type: "timestamp", nullable: true })
  codeExpired: Date;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @ManyToOne(() => Roles, (role) => role.users)
  role: Roles;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => TicketSale, (ticketSale) => ticketSale.customer)
  ticketSalesAsCustomer: TicketSale[];
}
