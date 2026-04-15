import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { auth } from "~/auth/utils/auth";
import { Request } from "express";

interface AuthenticatedRequest extends Request {
  user?: any;
  session?: any;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Récupération des métadonnées de rôles
    const roles = this.reflector.getAllAndOverride<string[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const session = await auth.api.getSession({
      headers: request.headers as HeadersInit,
    });

    if (!session) {
      throw new UnauthorizedException("Session invalide ou expirée");
    }

    request.user = session.user;
    request.session = session.session;

    if (!roles) {
      return true;
    }

    const userRole = session.user.role;

    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenException("Accès refusé : rôle insuffisant");
    }

    return true;
  }
}
