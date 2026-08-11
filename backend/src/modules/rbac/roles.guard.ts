import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      throw new ForbiddenException('User session not authenticated.');
    }

    // Role Hierarchy Matrix: SUPER_ADMIN > ADMIN > CAPTAIN > SELLER
    const roleHierarchy: Record<Role, number> = {
      SUPER_ADMIN: 4,
      ADMIN: 3,
      CAPTAIN: 2,
      SELLER: 1,
    };

    const userLevel = roleHierarchy[user.role as Role] || 0;
    const hasRolePermission = requiredRoles.some(role => userLevel >= roleHierarchy[role]);

    if (!hasRolePermission) {
      throw new ForbiddenException(
        `Role '${user.role}' is unauthorized to execute this action. Required: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
