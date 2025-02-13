import { Events } from 'src/modules/events/entities/event.entity';
import Users from 'src/modules/users/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity()
export class Tickets {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Events, (event) => event.tickets)
  event: Events;

  @ManyToOne(() => Users, (user) => user.tickets)
  user: Users;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column()
  status: string;
}
