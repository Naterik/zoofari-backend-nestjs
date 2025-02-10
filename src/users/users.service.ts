import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import Users from './entities/user.entity';
import { FindOptionsSelect, Repository } from 'typeorm';
import { hashPasswordUtils } from 'src/helpers/untils';
import Roles from 'src/roles/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
  ) {}

  isEmailExist = async (email: string) => {
    const user = await this.usersRepository.findOneBy({ email });
    if (user) return true;
    return false;
  };
  async create(createUserDto: CreateUserDto) {
    try {
      const {
        name,
        email,
        password,
        address,
        gender,
        isActive,
        date,
        phone,
        role: roleId = 1,
      } = createUserDto;
      const isExist = await this.isEmailExist(email);
      if (isExist) {
        throw new BadRequestException(`Email ${email} đã tồn tại`);
      }
      const hashPassword = await hashPasswordUtils(password);
      const role = await this.rolesRepository.findOne({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException('Role không tồn tại');
      }
      const user = await this.usersRepository.create({
        name,
        email,
        password: hashPassword,
        phone,
        role,
        isActive: isActive ?? true,
        date,
        address,
        gender,
      });
      const saveUser = await this.usersRepository.save(user);
      return {
        id: saveUser.id,
        message: 'success create user',
      };
    } catch (e) {
      console.log(e);
    }
    console.log('succes');
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async findByEmail(email: string) {
    return await this.usersRepository.findOne({ where: { email: email } });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { id },
        relations: ['role'],
      });
      if (!existingUser) {
        throw new NotFoundException('User không tồn tại');
      }

      let role = existingUser.role;
      if (updateUserDto.role) {
        const newRole = await this.rolesRepository.findOne({
          where: { id: updateUserDto.role },
        });

        if (!newRole) {
          throw new BadRequestException('Role không tồn tại');
        }
        role = newRole;
      }
      const updateData: Partial<Users> = {
        ...updateUserDto,
        role,
      };
      const result = await this.usersRepository.update(id, updateData);
      if (result.affected === 0) {
        throw new BadRequestException('Cập nhật thất bại');
      }
      const updatedUser = await this.usersRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.role', 'role')
        .where('user.id = :id', { id })
        .select([
          'user.id',
          'user.name',
          'user.email',
          'user.phone',
          'user.address',
          'user.gender',
          'user.date',
          'user.isActive',
          'role.id',
        ])
        .getOne();
      return {
        message: 'Cập nhật thành công',
        user: updatedUser,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException('Có lỗi xảy ra khi cập nhật user');
    }
  }

  async remove(id: number) {
    try {
      const result = await this.usersRepository.delete(id);

      if (result.affected === 0) {
        throw new BadRequestException('Xóa user thất bại');
      }

      return {
        message: 'Xóa user thành công',
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }
}
