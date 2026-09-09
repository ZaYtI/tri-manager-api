import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

export const BetterAuthHeaders = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): Headers =>
    fromNodeHeaders(ctx.switchToHttp().getRequest<Request>().headers),
);
