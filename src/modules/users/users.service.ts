import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import Users from "./entities/user.entity";
import { Repository } from "typeorm";
import { hashPasswordUtils } from "src/helpers/untils";
import Roles from "src/modules/roles/entities/role.entity";
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from "src/auth/dto/create-auth.dto";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { MailerService } from "@nestjs-modules/mailer";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import aqp from "api-query-params";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private usersRepository: Repository<Users>,
    @InjectRepository(Roles)
    private rolesRepository: Repository<Roles>,
    private readonly mailerService: MailerService
  ) {}

  async findAll(query: string, current: number, pageSize: number) {
    const { filter, sort } = aqp(query);

    if (filter.current) delete filter.current;
    if (filter.pageSize) delete filter.pageSize;

    current = current ? Number(current) : 1;
    pageSize = pageSize ? Number(pageSize) : 10;

    const totalItems = await this.usersRepository.count({ where: filter });
    const totalPages = Math.ceil(totalItems / pageSize);
    const skip = (current - 1) * pageSize;

    const results = await this.usersRepository.find({
      where: filter,
      order: sort as any,
      skip,
      take: pageSize,
      select: {
        password: false,
      },
    });

    return {
      meta: {
        current,
        pageSize,
        pages: totalPages,
        total: totalItems,
      },
      results,
    };
  }

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
        codeExpired,
        role: roleId = 1,
      } = createUserDto;
      const isExist = await this.isEmailExist(email);
      if (isExist) {
        return {
          message: `Email ${email} đã tồn tại`,
        };
      }
      const hashPassword = await hashPasswordUtils(password);
      const role = await this.rolesRepository.findOne({
        where: { id: roleId },
      });
      if (!role) {
        throw new BadRequestException("Role không tồn tại");
      }
      const user = await this.usersRepository.create({
        name,
        email,
        password: hashPassword,
        phone: phone ?? 0,
        role,
        isActive: isActive ?? false,
        dateOfBirth: dateOfBirth ?? new Date(),
        address: address ?? "UnKnown",
        gender: gender ?? "UNKnown",
        codeExpired: codeExpired ?? dayjs().add(3, "minutes").toDate(),
      });
      const saveUser = await this.usersRepository.save(user);
      return {
        id: saveUser.id,
        message: "success create user",
      };
    } catch (e) {
      console.log(e);
    }
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
        where: { id: +id },
        relations: ["role"],
      });
      if (!existingUser) {
        throw new NotFoundException("User không tồn tại");
      }
      let role = existingUser.role;
      if (updateUserDto.role) {
        const newRole = await this.rolesRepository.findOne({
          where: { id: updateUserDto.role },
        });

        if (!newRole) {
          throw new BadRequestException("Role không tồn tại");
        }
        role = newRole;
      }
      const updateData: Partial<Users> = {
        ...updateUserDto,
        role,
      };
      const result = await this.usersRepository.update(id, updateData);
      if (result.affected === 0) {
        throw new BadRequestException("Cập nhật thất bại");
      }
      const updatedUser = await this.usersRepository
        .createQueryBuilder("user")
        .leftJoinAndSelect("user.role", "role")
        .where("user.id = :id", { id: +id })
        .select([
          "user.id",
          "user.name",
          "user.email",
          "user.phone",
          "user.address",
          "user.gender",
          "user.dateOfBirth",
          "user.isActive",
          "role.id",
        ])
        .getOne();
      return {
        message: "Cập nhật thành công",
        user: updatedUser,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật user");
    }
  }

  async remove(id: number) {
    try {
      const result = await this.usersRepository.delete(id);

      if (result.affected === 0) {
        throw new BadRequestException("Xóa user thất bại");
      }

      return {
        message: "Xóa user thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }

  async handleRegister(registerDto: CreateAuthDto) {
    try {
      const { name, email, password } = registerDto;
      const isExist = await this.isEmailExist(email);
      if (isExist) {
        return {
          message: `Email ${email} đã tồn tại`,
        };
      }
      const hashPassword = await hashPasswordUtils(password);
      const codeId = uuidv4(); //random code id
      const user = await this.usersRepository.create({
        name: name || "Unnamed User",
        email: email,
        password: hashPassword,
        phone: "0000000000",
        address: "Unknown",
        gender: "Unknown",
        dateOfBirth: new Date(),
        isActive: false,
        role: { id: 1 },
        codeId: codeId,
        codeExpired: dayjs().add(10, "minutes").toDate(),
      });
      const savedUser = await this.usersRepository.save(user);

      //send mail
      this.mailerService.sendMail({
        to: user.email,
        subject: "Actived account",
        text: "welcome", // plaintext body
        template: "register",
        context: {
          name: user.name,
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
  //send verification code
  async handleActive(data: CodeAuthDto) {
    try {
      const { id, code } = data;
      const user = await this.usersRepository.findOne({
        where: { id: Number(id), codeId: code },
      });
      if (!user) {
        throw new BadRequestException("Mã code sai hoặc đã hết hạn");
      }
      // check code expired
      const isExpired = dayjs().isBefore(user.codeExpired);
      if (isExpired) {
        return this.usersRepository.update({ id: user.id }, { isActive: true });
      }
      return { isExpired };
    } catch (error) {
      console.log(error.message);
    }
  }
  async handleRetryActive(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Email không tồn tại");
    }
    //update user
    const codeId = uuidv4();
    await this.usersRepository.update(
      { id: user.id },
      {
        codeId: codeId,
        codeExpired: dayjs().add(3, "minutes").toDate(),
      }
    );
    //send mail
    this.mailerService.sendMail({
      to: user.email,
      subject: "Send code",
      text: "welcome", // plaintext body
      template: "sendcode",
      context: {
        name: user.name || "Unnamed User",
        activationCode: codeId,
      },
    });
    return {
      id: user.id,
      email: user.email,
    };
  }

  async handleRetryPassword(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Email không tồn tại");
    }
    const codeId = uuidv4();
    await this.usersRepository.update(
      { id: user.id },
      {
        codeId: codeId,
        codeExpired: dayjs().add(5, "minutes").toDate(),
      }
    );
    this.mailerService.sendMail({
      to: user.email,
      subject: "Reset password",
      text: "welcome", // plaintext body
      template: "sendcode",
      context: {
        name: user.name || "Unnamed User",
        activationCode: codeId,
      },
    });
    return {
      id: user.id,
      email: user.email,
    };
  }
  async handleChangePassword(data: ChangePasswordAuthDto) {
    if (data.password !== data.confirmPassword) {
      throw new BadRequestException("Mật khẩu không khớp");
    }
    const user = await this.findByEmail(data.email);
    if (!user) {
      throw new NotFoundException("Email không tồn tại");
    }
    const isExpired = dayjs().isBefore(user.codeExpired);
    if (isExpired) {
      const hashPassword = await hashPasswordUtils(data.password);
      await this.usersRepository.update(
        { id: user.id },
        { password: hashPassword }
      );
    }
    return {
      isExpired,
    };
  }
}
