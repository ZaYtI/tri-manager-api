import { createAccessControl } from "better-auth/plugins/access";

export const ORG_ROLE_ICONS = [
  "crown",
  "megaphone",
  "bike",
  "dumbbell",
  "shield",
  "shield-check",
  "star",
  "flag",
  "award",
  "clipboard-list",
  "users",
  "hand-helping",
  "heart-handshake",
  "wrench",
  "handshake",
] as const;

export type OrgRoleIcon = (typeof ORG_ROLE_ICONS)[number];

export const ORG_PERMISSION_STATEMENTS = {
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "cancel"],
  ac: ["create", "read", "update", "delete"],
} as const;

export type OrgPermissions = {
  -readonly [K in keyof typeof ORG_PERMISSION_STATEMENTS]?: string[];
};

export const ac = createAccessControl(ORG_PERMISSION_STATEMENTS);

const OWNER_PERMISSIONS = {
  organization: ["update", "delete"],
  member: ["create", "read", "update", "delete"],
  invitation: ["create", "cancel"],
  ac: ["create", "read", "update", "delete"],
} as const;

const COACH_PERMISSIONS = {
  member: ["read"],
} as const;

const ATHLETE_PERMISSIONS = {
  member: ["read"],
} as const;

export const ownerRole = ac.newRole(OWNER_PERMISSIONS);
export const coachRole = ac.newRole(COACH_PERMISSIONS);
export const athleteRole = ac.newRole(ATHLETE_PERMISSIONS);

const toPlain = (p: Record<string, readonly string[]>): OrgPermissions =>
  Object.fromEntries(Object.entries(p).map(([k, v]) => [k, [...v]]));

export const roles = {
  owner: ownerRole,
  coach: coachRole,
  athlete: athleteRole,
};

interface OrgRoleDisplay {
  label: string;
  color: string | null;
  icon: OrgRoleIcon | null;
  permissions: OrgPermissions;
}

export const ORG_ROLES: Record<string, OrgRoleDisplay> = {
  owner: {
    label: "Propriétaire",
    color: "#f59e0b",
    icon: "crown",
    permissions: toPlain(OWNER_PERMISSIONS),
  },
  coach: {
    label: "Coach",
    color: "#6366f1",
    icon: "megaphone",
    permissions: toPlain(COACH_PERMISSIONS),
  },
  athlete: {
    label: "Athlète",
    color: "#0ea5e9",
    icon: "bike",
    permissions: toPlain(ATHLETE_PERMISSIONS),
  },
};

export interface OrgRolePublic {
  role: string;
  label: string;
  color: string | null;
  icon: OrgRoleIcon | null;
  permissions: OrgPermissions;
  system: boolean;
}

export const ORG_ROLES_PUBLIC: OrgRolePublic[] = Object.entries(ORG_ROLES).map(
  ([role, cfg]) => ({
    role,
    label: cfg.label,
    color: cfg.color,
    icon: cfg.icon,
    permissions: cfg.permissions,
    system: true,
  }),
);

export const SYSTEM_ROLE_NAMES = Object.keys(ORG_ROLES);
