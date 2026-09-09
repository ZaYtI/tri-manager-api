import { Injectable } from "@nestjs/common";
import { AfterHook, Hook } from "@thallesp/nestjs-better-auth";
import type { AuthHookContext } from "@thallesp/nestjs-better-auth";

import { AuditService } from "../audit.service";
import { AUDIT_ACTIONS } from "../audit.constants";
import { AuditActor } from "../audit.types";

function readBody(ctx: AuthHookContext): Record<string, unknown> {
  const body = (ctx as { body?: unknown }).body;
  return body && typeof body === "object"
    ? (body as Record<string, unknown>)
    : {};
}

function str(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function readActor(ctx: AuthHookContext): AuditActor {
  const session = (
    ctx as {
      context?: {
        session?: {
          user?: { id?: unknown; email?: unknown };
          session?: { impersonatedBy?: unknown };
        };
      };
    }
  ).context?.session;
  return {
    id: str(session?.user?.id),
    email: str(session?.user?.email),
    impersonatedBy: str(session?.session?.impersonatedBy),
  };
}

@Hook()
@Injectable()
export class AdminAuditHook {
  constructor(private readonly audit: AuditService) {}

  @AfterHook("/admin/ban-user")
  async onBan(ctx: AuthHookContext) {
    const body = readBody(ctx);
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_BANNED,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(body.userId),
      metadata: { reason: str(body.banReason) },
    });
  }

  @AfterHook("/admin/unban-user")
  async onUnban(ctx: AuthHookContext) {
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_UNBANNED,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(readBody(ctx).userId),
    });
  }

  @AfterHook("/admin/set-role")
  async onSetRole(ctx: AuthHookContext) {
    const body = readBody(ctx);
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_ROLE_CHANGED,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(body.userId),
      metadata: { role: str(body.role) },
    });
  }

  @AfterHook("/admin/create-user")
  async onCreateUser(ctx: AuthHookContext) {
    const body = readBody(ctx);
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_CREATED,
      actor: readActor(ctx),
      targetType: "user",
      targetLabel: str(body.email),
      metadata: { role: str(body.role) },
    });
  }

  @AfterHook("/admin/remove-user")
  async onRemoveUser(ctx: AuthHookContext) {
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_DELETED,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(readBody(ctx).userId),
    });
  }

  @AfterHook("/admin/set-user-password")
  async onSetPassword(ctx: AuthHookContext) {
    await this.audit.record({
      action: AUDIT_ACTIONS.USER_PASSWORD_SET,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(readBody(ctx).userId),
    });
  }

  @AfterHook("/admin/impersonate-user")
  async onImpersonate(ctx: AuthHookContext) {
    await this.audit.record({
      action: AUDIT_ACTIONS.IMPERSONATION_STARTED,
      actor: readActor(ctx),
      targetType: "user",
      targetId: str(readBody(ctx).userId),
    });
  }

  @AfterHook("/admin/stop-impersonating")
  async onStopImpersonating(ctx: AuthHookContext) {
    await this.audit.record({
      action: AUDIT_ACTIONS.IMPERSONATION_STOPPED,
      actor: readActor(ctx),
      targetType: "user",
    });
  }
}
