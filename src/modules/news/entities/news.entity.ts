import { Event } from "src/modules/events/entities/event.entity";
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";

@Entity()
export class News {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  titile!: string;
  @Column()
  content?: string;
  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
  @Column({
    type: "timestamp",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updatedAt: Date;
  @OneToMany(() => Event, (events) => events.news)
  event: Event[];
}
