import { SetMetadata } from '@nestjs/common';

export const REQUIRE_PERMISSIONS_KEY = 'requirePermissions';

/** 声明接口所需的权限码，满足任一即通过 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);
