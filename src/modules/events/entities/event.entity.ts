import { Enclosure } from "src/modules/enclosures/entities/enclosure.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "datetime" })
  start_date: Date;

  @Column({ type: "datetime" })
  end_date: Date;

  @ManyToOne(() => Enclosure, (enclosure) => enclosure.events)
  @JoinColumn({ name: "enclosure_id" })
  enclosure: Enclosure;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;
}
