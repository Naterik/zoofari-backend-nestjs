import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Public, ResponseMessage, Roles } from "src/decorator/customized";
import { Paginate, Paginated, PaginateQuery } from "nestjs-paginate";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "src/auth/passport/jwt-auth.guard";
import { RolesGuard } from "src/auth/passport/roles.guard";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles("ADMIN") // Cập nhật thành "ADMIN"
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles("ADMIN", "EMPLOYEE")
  public findAll(@Query() query: PaginateQuery) {
    return this.usersService.findAll(query);
  }

  @Get(":id")
  @Roles("ADMIN", "EMPLOYEE") // Cập nhật thành "ADMIN" và "EMPLOYEE"
  findOne(@Param("id") id: string, @Req() req) {
    if (
      !req.user.roles.includes("ADMIN") &&
      !req.user.roles.includes("EMPLOYEE")
    ) {
      if (req.user.userId !== +id) {
        throw new UnauthorizedException(
          "You can only access your own user information"
        );
      }
    }
    return this.usersService.findOne(+id);
  }

  @Patch(":id")
  @Roles("ADMIN") // Cập nhật thành "ADMIN"
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(":id")
  @Roles("ADMIN") // Cập nhật thành "ADMIN"
  remove(@Param("id") id: string) {
    return this.usersService.remove(+id);
  }

  @Patch("profile/update")
  @UseGuards(JwtAuthGuard)
  updateProfile(@Req() req, @Body() updateProfileDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }
}
