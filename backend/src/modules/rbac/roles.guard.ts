// ============================================================================
// Jaxmart B2B Platform - Express RBAC Security Guard & Middleware
// Role Hierarchy Matrix: SUPER_ADMIN > ADMIN > CAPTAIN > SELLER > CUSTOMER
// ============================================================================

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'CAPTAIN' | 'SELLER' | 'CUSTOMER';

export const ROLE_HIERARCHY: Record<Role, number> = {
  SUPER_ADMIN: 5,
  ADMIN: 4,
  CAPTAIN: 3,
  SELLER: 2,
  CUSTOMER: 1,
};

/**
 * Check if a user's role satisfies required permission level
 */
export function hasRequiredRolePermission(userRole: Role, allowedRoles: Role[]): boolean {
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  return allowedRoles.some(requiredRole => userLevel >= (ROLE_HIERARCHY[requiredRole] || 0));
}

/**
 * Express Middleware Guard for Role Based Access Control
 */
export function checkRoleAccess(allowedRoles: Role[]) {
  return (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, error: 'Unauthorized user session.' });
    }

    if (!hasRequiredRolePermission(user.role as Role, allowedRoles)) {
      return res.status(403).json({
        success: false,
        error: `Role '${user.role}' is unauthorized to perform this operation. Required: ${allowedRoles.join(', ')}`
      });
    }

    next();
  };
}
