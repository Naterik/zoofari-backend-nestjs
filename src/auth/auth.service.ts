import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordUtils } from 'src/helpers/untils';
import { UsersService } from 'src/modules/users/users.service';
import { CodeAuthDto, CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) return null;
    const isValidPassword = await comparePasswordUtils(pass, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Mật khẩu không chính xác');
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
}
