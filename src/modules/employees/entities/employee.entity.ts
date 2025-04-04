import { TicketSale } from "src/modules/ticket.sales/entities/ticket.sale.entity";
import { User } from "src/modules/users/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("employees")
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: "user_id" })
  userId: number;

  @Column({ length: 50 })
  name: string;

  @Column({ length: 100 })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.employee)
  @JoinColumn({ name: "user_id" })
  user: User;

  @OneToMany(() => TicketSale, (ticketSale) => ticketSale.employee)
  ticketSales: TicketSale[];
}
