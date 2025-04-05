import { Enclosure } from "src/modules/enclosures/entities/enclosure.entity";
import { News } from "src/modules/news/entities/news.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @Column({ type: "datetime" })
  start_date: Date;

  @Column({ type: "datetime" })
  end_date: Date;

  @Column({
    type: "enum",
    enum: ["Upcoming", "Ongoing", "Finished"],
    default: "Upcoming",
  })
  status: string;

  @ManyToOne(() => Enclosure, (enclosure) => enclosure.events)
  @JoinColumn({ name: "enclosure_id" })
  enclosure: Enclosure;

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updated_at: Date;

  @ManyToOne(() => News, (news) => news.events, { nullable: true })
  @JoinColumn({ name: "news_id" })
  news: News | null;
}
