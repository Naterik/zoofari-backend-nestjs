import { Enclosure } from "src/modules/enclosures/entities/enclosure.entity";
import { Product } from "src/modules/products/entities/product.entity";
import { Species } from "src/modules/species/entities/species.entity";
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Image } from "src/modules/images/entities/image.entity";

@Entity("animals")
export class Animal {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255, nullable: false })
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

  @CreateDateColumn({ type: "datetime", name: "created_at" })
  created_at: Date;

  @UpdateDateColumn({ type: "datetime", name: "updated_at" })
  updated_at: Date;

  @OneToMany(() => Product, (product) => product.animal)
  products: Product[];

  @OneToMany(() => Image, (image) => image.animal)
  images: Image[];
}
