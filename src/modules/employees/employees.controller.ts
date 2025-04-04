import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { EmployeesService } from "./employees.service";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { UpdateEmployeeDto } from "./dto/update-employee.dto";
import { JwtAuthGuard } from "src/auth/passport/jwt-auth.guard";
import { RolesGuard } from "src/auth/passport/roles.guard";
import { Roles } from "src/decorator/customized";
import { PaginateQuery, Paginated } from "nestjs-paginate";
import { Employee } from "./entities/employee.entity";

@Controller("employees")
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin") // Only Admin can create employees
  create(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin", "Employee") // Admin and Employee can view all employees
  findAll(@Query() query: PaginateQuery): Promise<Paginated<Employee>> {
    return this.employeesService.findAll(query);
  }

  @Get(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin", "Employee") // Admin and Employee can view an employee
  findOne(@Param("id") id: string) {
    return this.employeesService.findOne(+id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin") // Only Admin can update employees
  update(
    @Param("id") id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto
  ) {
    return this.employeesService.update(+id, updateEmployeeDto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("Admin") // Only Admin can delete employees
  remove(@Param("id") id: string) {
    return this.employeesService.remove(+id);
  }
}
