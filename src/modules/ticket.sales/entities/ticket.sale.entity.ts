import { Employee } from "src/modules/employees/entities/employee.entity";
import { Ticket } from "src/modules/tickets/entities/ticket.entity";
import { Users } from "src/modules/users/entities/user.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("ticket_sales")
export class TicketSale {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Ticket, (ticket) => ticket.ticketSales)
  @JoinColumn({ name: "ticket_id" })
  ticket: Ticket;

  @ManyToOne(() => Users, (user) => user.ticketSalesAsCustomer)
  @JoinColumn({ name: "customer_id" })
  customer: Users;

  @ManyToOne(() => Employee, (employee) => employee.ticketSales)
  @JoinColumn({ name: "employee_id" })
  employee: Employee;

  @Column()
  quantity: number;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  total_price: number;

  // @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  // sale_date: Date;

  @Column({
    type: "enum",
    enum: ["Active", "Used", "Expired"],
    default: "Active",
  })
  status: string;
}
