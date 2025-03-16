import { Animal } from "src/modules/animals/entities/animal.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Event } from "src/modules/events/entities/event.entity";

@Entity("enclosures")
export class Enclosure {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 255 })
  location: string;

  @Column()
  capacity: number;

  @OneToMany(() => Animal, (animal) => animal.enclosure)
  animals: Animal[];

  @OneToMany(() => Event, (event) => event.enclosure)
  events: Event[];
}
