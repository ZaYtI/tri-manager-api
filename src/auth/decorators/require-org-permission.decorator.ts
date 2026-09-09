import { SetMetadata } from "@nestjs/common";

import { OrgPermissionRequirement } from "../types/org-permission.type";

export const ORG_PERMISSION_KEY = "org-permission";

export const RequireOrgPermission = (permissions: OrgPermissionRequirement) =>
  SetMetadata(ORG_PERMISSION_KEY, permissions);
