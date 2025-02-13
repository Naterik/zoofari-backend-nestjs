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
import Roles from 'src/modules/roles/entities/role.entity';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { CreateAuthDto } from 'src/auth/dto/create-auth.dto';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
    private readonly mailerService: MailerService,
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
        dateOfBirth,
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
        isActive: isActive ?? false,
        dateOfBirth,
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
  }

  async findAll(query: PaginateQuery): Promise<Paginated<Users>> {
    return paginate(query, this.usersRepository, {
      sortableColumns: ['id', 'name', 'email', 'dateOfBirth'],
      searchableColumns: ['name', 'email'],
      defaultSortBy: [['id', 'ASC']],
      defaultLimit: 10,
      maxLimit: 50,
    });
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

  async register(registerDto: CreateAuthDto) {
    try {
      const { name, email, password } = registerDto;
      const isExist = await this.isEmailExist(email);
      if (isExist) {
        throw new BadRequestException(`Email ${email} đã tồn tại`);
      }
      const hashPassword = await hashPasswordUtils(password);
      const codeId = uuidv4();
      const user = await this.usersRepository.create({
        name: name || 'Unnamed User',
        email,
        password: hashPassword,
        phone: '0000000000',
        address: 'Unknown',
        gender: 'Unknown',
        dateOfBirth: new Date(),
        isActive: false,
        role: { id: 1 },
        codeId: codeId,
        codeExpired: dayjs().add(1, 'days').toDate(),
      });
      const savedUser = await this.usersRepository.save(user);

      this.mailerService.sendMail({
        to: user.email,
        subject: 'Actived account',
        text: 'welcome', // plaintext body
        template: 'register',
        context: {
          name: user.name || user.email,
          activationCode: codeId,
        },
      });
      return {
        id: savedUser.id,
      };
    } catch (e) {
      console.log(e);
    }
  }
}
