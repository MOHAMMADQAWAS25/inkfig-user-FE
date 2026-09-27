export function hasPermission(
  permissionCodes: readonly string[],
  requiredPermission: string,
): boolean {
  return permissionCodes.includes(requiredPermission);
}

export function hasAnyPermission(
  permissionCodes: readonly string[],
  requiredPermissions: readonly string[],
): boolean {
  return requiredPermissions.some((permission) => hasPermission(permissionCodes, permission));
}
