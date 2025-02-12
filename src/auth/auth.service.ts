import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePasswordUtils } from 'src/helpers/untils';
import { UsersService } from 'src/users/users.service';
import { CreateAuthDto } from './dto/create-auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);
    if (!user) {
      throw new Error('User not found');
    }
    const isValidPassword = await comparePasswordUtils(pass, user.password);
    if (!isValidPassword) return null;
    return user;
  }

  async login(user: any) {
    const payload = { username: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(registerDto: CreateAuthDto) {
    return await this.usersService.register(registerDto);
  }
}
