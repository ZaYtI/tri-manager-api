import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { auth } from "~/auth/utils/auth";
import { ORG_PERMISSION_KEY } from "../decorators/require-org-permission.decorator";
import { OrgPermissionRequirement } from "../types/org-permission.type";

const APP_ADMIN_ROLE = "admin";
const READ_METHODS = ["GET", "HEAD", "OPTIONS"];

@Injectable()
export class OrgPermissionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<OrgPermissionRequirement>(
      ORG_PERMISSION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: { role?: string | null } | null }>();

    const isAppAdmin = request.user?.role === APP_ADMIN_ROLE;
    if (isAppAdmin && READ_METHODS.includes(request.method)) return true;

    const orgId = request.params?.orgId;
    if (typeof orgId !== "string" || !orgId) {
      throw new ForbiddenException("Organisation non spécifiée");
    }

    const result = (await auth.api.hasPermission({
      body: {
        permission: undefined,
        permissions: required,
        organizationId: orgId,
      },
      headers: fromNodeHeaders(request.headers),
    })) as { success: boolean };

    if (!result.success) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission requise sur cette organisation",
      );
    }
    return true;
  }
}
