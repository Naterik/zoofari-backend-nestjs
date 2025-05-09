import { Animal } from "src/modules/animals/entities/animal.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";

@Entity("species")
export class Species {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, nullable: true })
  scientific_name: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: ["Endangered", "Vulnerable", "Least Concern", "Not Evaluated"],
    nullable: true,
  })
  conservation_status: string;

  // New fields
  @Column({ type: "text", nullable: true })
  diet: string;

  @Column({ type: "text", nullable: true })
  habitat: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  family: string;

  @OneToMany(() => Animal, (animal) => animal.species)
  animals: Animal[];
}
