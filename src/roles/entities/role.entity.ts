import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import Users from 'src/users/entities/user.entity';

@Entity()
class Roles {
  @PrimaryGeneratedColumn()
  id!: number;
  @Column()
  name!: string;
  @OneToMany(() => Users, (user) => user.role)
  users: Users[];
}
export default Roles;
