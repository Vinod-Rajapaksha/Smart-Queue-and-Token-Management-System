export type Role = "ADMIN" | "MANAGER" | "STAFF" | "CUSTOMER";

// Check if user has allowed role
export function hasRole(
  userRole: Role | null | undefined,
  allowed: readonly Role[]
): boolean {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

// Check admin access
export function isAdmin(role: Role | null | undefined): boolean {
  return role === "ADMIN";
}
