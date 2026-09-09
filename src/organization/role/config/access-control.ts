import { createAccessControl } from "better-auth/plugins/access";
import {
  defaultStatements,
  ownerAc,
} from "better-auth/plugins/organization/access";

export const orgStatement = {
  ...defaultStatements,
} as const;

export const orgAccessControl = createAccessControl(orgStatement);

export type OrgPermission = Record<string, string[]>;

export const FULL_PERMISSION = ownerAc.statements as OrgPermission;

export const creatorRoleDefinition = orgAccessControl.newRole(
  ownerAc.statements,
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
      },
    },
  ];

export const orgRoleStatements = orgStatement;
