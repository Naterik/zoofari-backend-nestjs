import { News } from 'src/modules/news/entities/news.entity';
import { Tickets } from 'src/modules/tickets/entities/ticket.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
@Entity()
export class Events {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  titile!: string;
  @Column()
  description?: string;
  @Column({ type: 'timestamp' })
  startDate?: Date;
  @Column({ type: 'timestamp' })
  endDate?: Date;
  @OneToMany(() => Tickets, (tickets) => tickets.event)
  tickets: Tickets[];
  @OneToMany(() => News, (news) => news.event)
  news: News[];
}
