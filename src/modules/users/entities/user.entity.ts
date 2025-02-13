import { Orders } from 'src/modules/orders/entities/order.entity';
import Roles from 'src/modules/roles/entities/role.entity';
import { Tickets } from 'src/modules/tickets/entities/ticket.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';

@Entity()
class Users {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  address: string;
  @Column()
  phone!: string;
  @Column()
  gender: string;
  @Column({ type: 'timestamp' })
  dateOfBirth: Date;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column()
  isActive: Boolean;
  @Column({ default: 'LOCAL' })
  accountType: string;
  @Column()
  codeId: string;
  @Column({ type: 'timestamp' })
  codeExpired: Date;
  @ManyToOne(() => Roles, (role) => role.users)
  role: Roles;
  @OneToMany(() => Orders, (orders) => orders.user)
  orders: Orders[];
  @OneToMany(() => Tickets, (tickets) => tickets.user)
  tickets: Tickets[];
}

export default Users;
