import Products from 'src/modules/products/entities/product.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity()
class Animals {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  name!: string;
  @Column()
  age?: number;
  @Column()
  description?: string;
  @Column()
  categories?: string;
  @Column()
  habitats?: string;
  @Column()
  conservations?: string;
  @OneToMany(() => Products, (product) => product.animal)
  products: Products[];
}
export default Animals;
