export const AUDIT_ACTIONS = {
  USER_BANNED: "user.banned",
  USER_UNBANNED: "user.unbanned",
  USER_ROLE_CHANGED: "user.role_changed",
  USER_CREATED: "user.created",
  USER_DELETED: "user.deleted",
  USER_PASSWORD_SET: "user.password_set",
  IMPERSONATION_STARTED: "impersonation.started",
  IMPERSONATION_STOPPED: "impersonation.stopped",
  ORGANIZATION_CREATED: "organization.created",
  ORGANIZATION_UPDATED: "organization.updated",
  ORGANIZATION_DEACTIVATED: "organization.deactivated",
  ORGANIZATION_REACTIVATED: "organization.reactivated",
  ORGANIZATION_DELETED: "organization.deleted",
  MEMBER_ADDED: "member.added",
  MEMBER_ROLE_CHANGED: "member.role_changed",
  MEMBER_REMOVED: "member.removed",
  INVITATION_CREATED: "invitation.created",
  INVITATION_CANCELED: "invitation.canceled",
  INVITATION_ACCEPTED: "invitation.accepted",
  ROLE_CREATED: "role.created",
  ROLE_UPDATED: "role.updated",
  ROLE_DELETED: "role.deleted",
} as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];

export type AuditTargetType =
  | "user"
  | "organization"
  | "member"
  | "invitation"
  | "role";
