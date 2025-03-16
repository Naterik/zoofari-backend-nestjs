import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { comparePasswordUtils } from "src/helpers/untils";
import { UsersService } from "src/modules/users/users.service";
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from "./dto/create-auth.dto";
import { UpdateProfileDto } from "src/modules/users/dto/update-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordUtils(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException("Mật khẩu không chính xác");
    }
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      user: {
        email: user.email,
        id: user.id,
        name: user.name,
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return await this.usersService.handleRegister(registerDto);
  }
  async checkCode(data: CodeAuthDto) {
    return await this.usersService.handleActive(data);
  }
  async retryActive(data: string) {
    return await this.usersService.handleRetryActive(data);
  }
  async retryPassword(data: string) {
    return await this.usersService.handleRetryPassword(data);
  }
  async changePassword(data: ChangePasswordAuthDto) {
    return await this.usersService.handleChangePassword(data);
  }
  async updateProfile(userId: number, data: UpdateProfileDto) {
    return await this.usersService.updateProfile(userId, data);
  }
}
