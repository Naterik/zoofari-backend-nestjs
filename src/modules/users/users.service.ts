import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { User, Gender } from "./entities/user.entity";
import { In, Repository } from "typeorm";
import { hashPasswordUtils } from "src/helpers/untils";
import { Role } from "src/modules/roles/entities/role.entity";
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from "src/auth/dto/create-auth.dto";
import { v4 as uuidv4 } from "uuid";
import dayjs from "dayjs";
import { MailerService } from "@nestjs-modules/mailer";
import { PaginateQuery } from "nestjs-paginate";
import { UserRole } from "src/modules/user_role/entities/user_role.entity";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private readonly mailerService: MailerService
  ) {}

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [users, total] = await this.usersRepository.findAndCount({
        skip,
        take: limit,
        order: { id: "DESC" },
        select: ["id", "name", "email", "phone"],
        relations: ["userRoles", "userRoles.role"],
      });

      return {
        data: users,
        meta: {
          totalItems: total,
          itemCount: users.length,
          itemsPerPage: limit,
          totalPages: Math.ceil(total / limit),
          currentPage: page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch users");
    }
  }

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ email });
    return !!user;
  }

  async create(createUserDto: CreateUserDto) {
    try {
      const { name, email, password, address, gender, dateOfBirth, phone } =
        createUserDto;

      const isExist = await this.isEmailExist(email);
      if (isExist) {
        throw new BadRequestException(`Email ${email} đã tồn tại`);
      }

      const hashPassword = await hashPasswordUtils(password);
      const defaultRole = await this.rolesRepository.findOne({
        where: { id: 1 },
      });
      if (!defaultRole) {
        throw new BadRequestException("Default role (USER) does not exist");
      }

      const user = this.usersRepository.create({
        name: name || "Unnamed User",
        email,
        password: hashPassword,
        phone: phone || "",
        dateOfBirth: dateOfBirth ? dayjs(dateOfBirth).toDate() : undefined,
        address: address || "",
        gender: gender || Gender.OTHER,
        userRoles: [],
      });

      const savedUser = await this.usersRepository.save(user);

      const userRole = this.userRoleRepository.create({
        userId: savedUser.id,
        roleId: defaultRole.id,
        user: savedUser,
        role: defaultRole,
      });

      await this.userRoleRepository.save(userRole);

      const userWithRoles = await this.usersRepository.findOne({
        where: { id: savedUser.id },
        relations: ["userRoles", "userRoles.role"],
        select: ["id", "name", "email", "phone", "userRoles"],
      });

      return userWithRoles;
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo user");
    }
  }

  async findOne(id: number) {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["userRoles", "userRoles.role"],
    });
    if (!user) {
      throw new NotFoundException(`User với id ${id} không tồn tại`);
    }
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ["userRoles", "userRoles.role"],
    });
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      const existingUser = await this.usersRepository.findOne({
        where: { id },
        relations: ["userRoles", "userRoles.role"],
      });
      if (!existingUser) {
        throw new NotFoundException("User không tồn tại");
      }

      // Update user fields
      const updateData: Partial<User> = {
        name: updateUserDto.name ?? existingUser.name,
        email: updateUserDto.email ?? existingUser.email,
        password: updateUserDto.password
          ? await hashPasswordUtils(updateUserDto.password)
          : existingUser.password,
        phone: updateUserDto.phone ?? existingUser.phone,
        address: updateUserDto.address ?? existingUser.address,
        gender: updateUserDto.gender ?? existingUser.gender,
        dateOfBirth: updateUserDto.dateOfBirth
          ? dayjs(updateUserDto.dateOfBirth).toDate()
          : existingUser.dateOfBirth,
        isActive: updateUserDto.isActive ?? existingUser.isActive,
      };

      // Update the user entity with the new fields (excluding userRoles for now)
      await this.usersRepository.update(id, updateData);

      // Handle role updates if roleIds are provided
      if (updateUserDto.roleIds) {
        // Fetch the new roles
        const newRoles = await this.rolesRepository.findBy({
          id: In(updateUserDto.roleIds),
        });
        if (newRoles.length !== updateUserDto.roleIds.length) {
          throw new BadRequestException("Một hoặc nhiều role không tồn tại");
        }

        // Delete existing user_roles entries for this user
        await this.userRoleRepository.delete({ userId: id });

        // Create new user_roles entries
        const newUserRoles = newRoles.map((role) => {
          const userRole = this.userRoleRepository.create({
            userId: id,
            roleId: role.id,
            user: existingUser,
            role: role,
          });
          return userRole;
        });

        // Save the new user_roles entries
        await this.userRoleRepository.save(newUserRoles);
      }

      // Fetch the updated user with roles
      const updatedUser = await this.usersRepository.findOne({
        where: { id },
        relations: ["userRoles", "userRoles.role"],
        select: ["id", "name", "email", "phone", "userRoles"],
      });

      return updatedUser;
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
      const codeId = uuidv4();
      const defaultRole = await this.rolesRepository.findOne({
        where: { id: 1 },
      });
      if (!defaultRole) {
        throw new BadRequestException("Role mặc định không tồn tại");
      }

      const user = this.usersRepository.create({
        name: name || "Unnamed User",
        email,
        password: hashPassword,
        phone: "",
        address: "",
        gender: Gender.OTHER,
        dateOfBirth: dayjs().toDate(),
        isActive: false,
        userRoles: [{ role: defaultRole } as UserRole],
        codeId,
        codeExpired: dayjs().add(10, "minutes").toDate(),
      });

      const savedUser = await this.usersRepository.save(user);

      this.mailerService.sendMail({
        to: user.email,
        subject: "Actived account",
        text: "welcome",
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
      throw new BadRequestException("Có lỗi xảy ra khi đăng ký");
    }
  }

  async handleActive(data: CodeAuthDto) {
    try {
      const { id, code } = data;
      const user = await this.usersRepository.findOne({
        where: { id: Number(id), codeId: code },
      });
      if (!user) {
        throw new BadRequestException("Mã code sai hoặc đã hết hạn");
      }

      const isNotExpired = dayjs().isBefore(user.codeExpired);
      if (isNotExpired) {
        await this.usersRepository.update({ id: user.id }, { isActive: true });
        return { message: "Kích hoạt tài khoản thành công" };
      }
      return { message: "Mã code đã hết hạn" };
    } catch (error) {
      console.log(error.message);
      throw new BadRequestException("Có lỗi xảy ra khi kích hoạt");
    }
  }

  async handleRetryActive(email: string) {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException("Email không tồn tại");
    }

    const codeId = uuidv4();
    await this.usersRepository.update(
      { id: user.id },
      {
        codeId,
        codeExpired: dayjs().add(3, "minutes").toDate(),
      }
    );

    this.mailerService.sendMail({
      to: user.email,
      subject: "Send code",
      text: "welcome",
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
        codeId,
        codeExpired: dayjs().add(5, "minutes").toDate(),
      }
    );

    this.mailerService.sendMail({
      to: user.email,
      subject: "Reset password",
      text: "welcome",
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

    const isNotExpired = dayjs().isBefore(user.codeExpired);
    if (isNotExpired) {
      const hashPassword = await hashPasswordUtils(data.password);
      await this.usersRepository.update(
        { id: user.id },
        { password: hashPassword }
      );
      return { message: "Đổi mật khẩu thành công" };
    }
    return { message: "Mã code đã hết hạn" };
  }

  async updateProfile(userId: number, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException("Người dùng không tồn tại");
    }

    const updateData: Partial<User> = {
      name: updateUserDto.name ?? user.name,
      address: updateUserDto.address ?? user.address,
      phone: updateUserDto.phone ?? user.phone,
      gender: updateUserDto.gender ?? user.gender,
      dateOfBirth: updateUserDto.dateOfBirth
        ? dayjs(updateUserDto.dateOfBirth).toDate()
        : user.dateOfBirth,
    };

    await this.usersRepository.update(userId, updateData);
    const updatedUser = await this.usersRepository.findOne({
      where: { id: userId },
      select: [
        "id",
        "name",
        "email",
        "phone",
        "address",
        "gender",
        "dateOfBirth",
      ],
    });

    return {
      message: "Cập nhật thông tin cá nhân thành công",
      user: updatedUser,
    };
  }
}
