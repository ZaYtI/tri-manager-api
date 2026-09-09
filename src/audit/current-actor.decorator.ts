import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import { AuditActor } from "./audit.types";

type RequestWithAuth = Request & {
  user?: { id?: string; email?: string } | null;
  session?: { session?: { impersonatedBy?: string | null } | null } | null;
};

export const CurrentActor = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuditActor => {
    const request = ctx.switchToHttp().getRequest<RequestWithAuth>();
    return {
      id: request.user?.id ?? null,
      email: request.user?.email ?? null,
      impersonatedBy: request.session?.session?.impersonatedBy ?? null,
    };
  },
);
