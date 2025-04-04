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
  @Post("login")
  @UseGuards(LocalAuthGuard)
  @ResponseMessage("Fetch login")
  handleLogin(@Request() req) {
    if (!req.user || !req.user.id) {
      throw new BadRequestException("User data is invalid or missing");
    }
    return this.authService.login(req.user);
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
