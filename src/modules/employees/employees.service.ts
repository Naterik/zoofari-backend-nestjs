import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { Employee } from "./entities/employee.entity";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { User } from "src/modules/users/entities/user.entity";
import { Role } from "src/modules/roles/entities/role.entity";
import { UserRole } from "src/modules/user_role/entities/user_role.entity";
import { PaginateQuery } from "nestjs-paginate";
import { hashPasswordUtils } from "src/helpers/untils";
import { AccountType } from "src/modules/users/entities/user.entity";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const { name, email, password, phone, roleIds = [2] } = createEmployeeDto; // Mặc định roleId = 2 (Employee)

      // Kiểm tra email đã tồn tại chưa
      const existingUser = await this.usersRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        return {
          message: `Email ${email} đã tồn tại`,
        };
      }

      // Tạo user mới cho employee
      const roles = await this.rolesRepository.findBy({ id: In(roleIds) });
      if (roles.length !== roleIds.length) {
        throw new BadRequestException("Một hoặc nhiều role không tồn tại");
      }

      const hashedPassword = await hashPasswordUtils(password); // Hash password
      const user = this.usersRepository.create({
        name,
        email,
        password: hashedPassword,
        accountType: AccountType.EMPLOYEE,
        userRoles: roles.map((role) => {
          const userRole = new UserRole();
          userRole.role = role;
          return userRole;
        }),
      });

      const savedUser = await this.usersRepository.save(user);

      // Tạo employee liên kết với user
      const employee = this.employeesRepository.create({
        name,
        email,
        phone,
        userId: savedUser.id,
        user: savedUser,
      });

      const savedEmployee = await this.employeesRepository.save(employee);
      return {
        id: savedEmployee.id,
        message: "Tạo employee thành công",
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo employee");
    }
  }

  async ensureEmployeeExists(userId: number): Promise<void> {
    try {
      // Tìm user và kiểm tra vai trò
      const user = await this.usersRepository.findOne({
        where: { id: userId },
        relations: ["userRoles", "userRoles.role"],
      });

      if (!user) {
        throw new NotFoundException(`User với id ${userId} không tồn tại`);
      }

      // Kiểm tra xem user có vai trò EMPLOYEE không
      const hasEmployeeRole = user.userRoles.some(
        (userRole) => userRole.role.id === 2 // Giả định roleId 2 là EMPLOYEE
      );

      if (!hasEmployeeRole) {
        return; // Nếu không có vai trò EMPLOYEE, không làm gì
      }

      // Kiểm tra xem user đã có bản ghi trong bảng Employees chưa
      const existingEmployee = await this.employeesRepository.findOne({
        where: { userId },
      });

      if (existingEmployee) {
        return; // Nếu đã có bản ghi, không làm gì
      }

      // Tạo bản ghi mới trong bảng Employees
      const employee = this.employeesRepository.create({
        userId: user.id,
        user: user,
        name: user.name,
        email: user.email,
        phone: user.phone,
      });

      await this.employeesRepository.save(employee);
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi tạo employee tự động");
    }
  }

  async findAll(query: PaginateQuery): Promise<any> {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [employees, total] = await this.employeesRepository.findAndCount({
        skip,
        take: limit,
        order: { id: "DESC" },
        select: ["id", "name", "email", "phone"],
        relations: ["user", "user.userRoles", "user.userRoles.role"],
      });

      return {
        data: employees,
        meta: {
          totalItems: total,
          itemCount: employees.length,
          itemsPerPage: +limit,
          totalPages: Math.ceil(total / limit),
          currentPage: +page,
        },
      };
    } catch (error) {
      console.error("Error in findAll:", error);
      throw new BadRequestException("Failed to fetch employees");
    }
  }

  async findOne(id: number) {
    const employee = await this.employeesRepository.findOne({
      where: { id },
      relations: ["user", "user.userRoles", "user.userRoles.role"],
    });
    if (!employee) {
      throw new NotFoundException(`Employee với id ${id} không tồn tại`);
    }
    return employee;
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    try {
      const employee = await this.findOne(id);
      const user = employee.user;

      let userRoles = user.userRoles;
      if (updateEmployeeDto.roleIds) {
        const newRoles = await this.rolesRepository.findBy({
          id: In(updateEmployeeDto.roleIds),
        });
        if (newRoles.length !== updateEmployeeDto.roleIds.length) {
          throw new BadRequestException("Một hoặc nhiều role không tồn tại");
        }
        userRoles = newRoles.map((role) => {
          const userRole = new UserRole();
          userRole.role = role;
          userRole.user = user;
          return userRole;
        });
      }

      const updateUserData: Partial<User> = {
        name: updateEmployeeDto.name ?? user.name,
        email: updateEmployeeDto.email ?? user.email,
        userRoles,
      };

      // Kiểm tra email nếu thay đổi
      if (updateEmployeeDto.email && updateEmployeeDto.email !== user.email) {
        const existingUserWithEmail = await this.usersRepository.findOne({
          where: { email: updateEmployeeDto.email },
        });
        if (existingUserWithEmail && existingUserWithEmail.id !== user.id) {
          throw new BadRequestException(
            `Email ${updateEmployeeDto.email} đã tồn tại`
          );
        }
      }

      await this.usersRepository.save({ ...user, ...updateUserData });

      const updateEmployeeData: Partial<Employee> = {
        name: updateEmployeeDto.name ?? employee.name,
        email: updateEmployeeDto.email ?? employee.email,
        phone: updateEmployeeDto.phone ?? employee.phone,
      };

      await this.employeesRepository.save({
        ...employee,
        ...updateEmployeeData,
      });
      const updatedEmployee = await this.findOne(id);

      return {
        message: "Cập nhật thành công",
        employee: updatedEmployee,
      };
    } catch (e) {
      console.log(e);
      throw new BadRequestException("Có lỗi xảy ra khi cập nhật employee");
    }
  }

  async remove(id: number) {
    try {
      const employee = await this.findOne(id);
      const userId = employee.userId;

      // Xóa employee
      const result = await this.employeesRepository.delete(id);
      if (result.affected === 0) {
        throw new BadRequestException("Xóa employee thất bại");
      }

      // Xóa user liên quan
      await this.usersRepository.delete(userId);

      return {
        message: "Xóa employee thành công",
        affected: result.affected,
      };
    } catch (e) {
      throw e;
    }
  }
}
