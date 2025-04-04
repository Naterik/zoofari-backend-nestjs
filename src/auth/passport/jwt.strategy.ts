// jwt.strategy.ts
import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { UsersService } from "src/modules/users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    const secret = configService.get<string>("JWT_SECRET");
    if (!secret) {
      throw new Error("Missing JWT_SECRET");
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: any) {
    const userData = await this.usersService.findOne(payload.sub);
    if (!userData) {
      throw new UnauthorizedException("User not found");
    }

    const roles = userData.userRoles.map((userRole) => userRole.role.name);

    return {
      userId: payload.sub,
      email: payload.username,
      roles: roles,
      accountType: userData.accountType,
    };
  }
}
