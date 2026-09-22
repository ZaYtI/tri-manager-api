import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const orgStatement = {
  ...defaultStatements,
  training: ["create", "update", "cancel", "delete"],
} as const;

export const orgAccessControl = createAccessControl(orgStatement);

export type OrgPermission = Record<string, string[]>;

const fullPermissionStatements = {
  ...ownerAc.statements,
  training: ["create", "update", "cancel", "delete"],
} as const;

export const FULL_PERMISSION =
  fullPermissionStatements as unknown as OrgPermission;

export const creatorRoleDefinition = orgAccessControl.newRole(
  fullPermissionStatements,
);

export const orgRoles: Record<string, typeof creatorRoleDefinition> = {
  createur: creatorRoleDefinition,
};

export const ORG_CREATOR_ROLE = "createur";
export const ORG_DEFAULT_MEMBER_ROLE = "athlete";

export type OrgRoleName = "createur" | "president" | "coach" | "athlete";

export const DEFAULT_ORG_ROLES: { role: string; permission: OrgPermission }[] =
  [
    { role: "president", permission: FULL_PERMISSION },
    {
      role: "coach",
      permission: {
        member: ["create", "update"],
        invitation: ["create", "cancel"],
        training: ["create", "update", "cancel", "delete"],
      },
    },
    {
      role: "athlete",
      permission: {
        organization: [],
        member: [],
        invitation: [],
        team: [],
        ac: [],
        training: [],
      },
    },
  ];

export const orgRoleStatements = orgStatement;
