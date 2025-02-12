import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

//Guards nếu có data là đăng nhập thành công nếu k thì chưa , coi như là 1 middleware của express , trước khi đến controller phải thông qua nó thì mới chạy tiếp đc
@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super();
  }

  //lay nguoi dung dang dang nhap
  async validate(username: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException('User không hợp lệ');
    }

    if (user.isActive === false) {
      throw new BadRequestException(
        'Tài khoàn chưa được kích hoạt không hợp lệ',
      );
    }
    return user;
  }
  //user đc trả về do có thư viện về
}
