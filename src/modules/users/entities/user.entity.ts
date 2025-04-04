import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserRole } from "src/modules/user_role/entities/user_role.entity";
import { Employee } from "src/modules/employees/entities/employee.entity";
import { Order } from "src/modules/orders/entities/order.entity";
import { TicketSale } from "src/modules/ticket.sales/entities/ticket.sale.entity";

export enum AccountType {
  CUSTOMER = "customer",
  EMPLOYEE = "employee",
  ADMIN = "admin",
}

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ type: "enum", enum: Gender, default: Gender.OTHER })
  gender: Gender;

  @Column({ type: "timestamp", nullable: true, name: "dateOfBirth" })
  dateOfBirth: Date;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: "boolean", default: true, name: "isActive" })
  isActive: boolean;

  @Column({
    type: "enum",
    enum: AccountType,
    default: AccountType.CUSTOMER,
    name: "accountType",
  })
  accountType: AccountType;

  @Column({ length: 50, nullable: true, name: "codeId" })
  codeId: string;

  @Column({ type: "timestamp", nullable: true, name: "codeExpired" })
  codeExpired: Date;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  @OneToOne(() => Employee, (employee) => employee.user)
  employee: Employee;

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => TicketSale, (ticketSale) => ticketSale.customer)
  ticketSalesAsCustomer: TicketSale[];
}
