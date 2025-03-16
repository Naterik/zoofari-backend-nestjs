import { Enclosure } from "src/modules/enclosures/entities/enclosure.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Species } from "src/modules/species/entities/species.entity";
import { Image } from "src/modules/images/entities/image.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";

@Entity("animals")
export class Animal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @ManyToOne(() => Species, (species) => species.animals)
  @JoinColumn({ name: "species_id" })
  species: Species;

  @ManyToOne(() => Enclosure, (enclosure) => enclosure.animals)
  @JoinColumn({ name: "enclosure_id" })
  enclosure: Enclosure;

  @Column({ type: "date", nullable: true })
  birth_date: Date;

  @Column({
    type: "enum",
    enum: ["Male", "Female", "Unknown"],
    default: "Unknown",
  })
  gender: string;

  @Column({ length: 255 })
  health_status: string;

  @Column({ type: "datetime", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({
    type: "datetime",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  updated_at: Date;

  @OneToMany(() => Product, (product) => product.animal)
  products: Product[];

  @OneToMany(() => Image, (image) => image.animal)
  images: Image[];
}
