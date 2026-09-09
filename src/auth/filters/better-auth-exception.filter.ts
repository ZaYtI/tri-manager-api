import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { APIError } from "better-auth/api";
import type { Response } from "express";

@Catch(APIError)
export class BetterAuthExceptionFilter implements ExceptionFilter {
  catch(exception: APIError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      typeof exception.statusCode === "number"
        ? exception.statusCode
        : HttpStatus.BAD_REQUEST;
    const body = exception.body as
      | { message?: string; code?: string }
      | undefined;

    response.status(status).json({
      statusCode: status,
      message: body?.message ?? exception.message,
      code: body?.code,
    });
  }
}
