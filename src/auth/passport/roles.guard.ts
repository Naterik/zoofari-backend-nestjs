import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      "roles",
      context.getHandler()
    );
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const hasRole = requiredRoles.some((role) =>
      user.roles?.map((r) => r.toLowerCase()).includes(role.toLowerCase())
    );

    if (!hasRole) {
      throw new ForbiddenException("Bạn không có quyền truy cập"); // Thay đổi thông báo tại đây
    }

    return true;
  }
}
