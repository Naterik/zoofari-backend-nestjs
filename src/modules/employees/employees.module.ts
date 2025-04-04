import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EmployeesService } from "./employees.service";
import { EmployeesController } from "./employees.controller";
import { Employee } from "./entities/employee.entity";
import { Role } from "src/modules/roles/entities/role.entity";
import { UserRole } from "../user_role/entities/user_role.entity";
import { User } from "../users/entities/user.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Employee, Role, UserRole, User])],
  controllers: [EmployeesController],
  providers: [EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
