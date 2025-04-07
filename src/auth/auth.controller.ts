import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  Get,
  UnauthorizedException,
  Patch,
  BadRequestException,
  HttpStatus,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./passport/local-auth.guard";
import { JwtAuthGuard } from "./passport/jwt-auth.guard";
import { Public, ResponseMessage } from "src/decorator/customized";
import {
  ChangePasswordAuthDto,
  CodeAuthDto,
  CreateAuthDto,
} from "./dto/create-auth.dto";
import { MailerService } from "@nestjs-modules/mailer";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailerService: MailerService
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post("login")
  async login(@Body() body: { username: string; password: string }) {
    const user = await this.authService.validateUser(
      body.username,
      body.password
    );
    if (!user) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: "Thông tin đăng nhập không hợp lệ",
        error: "InvalidEmailPasswordError",
      };
    }
    if (!user.isActive) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: "Tài khoản chưa được kích hoạt",
        error: "InactiveAccountError",
      };
    }
    const loginResult = await this.authService.login(user);
    // Đặt HTTP status code là 200
    const response = {
      statusCode: HttpStatus.OK,
      message: "Đăng nhập thành công",
      data: loginResult,
    };
    return response;
  }

  // @UseGuards(JwtAuthGuard)
  @Post("register")
  @Public()
  register(@Body() registerDto: CreateAuthDto) {
    return this.authService.register(registerDto);
  }
  @Post("check-code")
  @Public()
  checkCode(@Body() checkcodeDto: CodeAuthDto) {
    return this.authService.checkCode(checkcodeDto);
  }

  @Post("retry-active")
  @Public()
  retryActive(@Body("email") email: string) {
    return this.authService.retryActive(email);
  }
  @Post("retry-password")
  @Public()
  retryPassword(@Body("email") email: string) {
    return this.authService.retryPassword(email);
  }

  @Post("change-password")
  @Public()
  changePassword(@Body() changePassDto: ChangePasswordAuthDto) {
    return this.authService.changePassword(changePassDto);
  }
  // @UseGuards(JwtAuthGuard)
  @Public()
  @Patch("profile")
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: ChangePasswordAuthDto
  ) {
    const userId = req.user.userId; // Lấy userId từ payload JWT
    return this.authService.updateProfile(userId, updateProfileDto);
  }
}
