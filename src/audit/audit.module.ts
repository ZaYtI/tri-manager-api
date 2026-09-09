import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { AuditLogEntity } from "./entities/audit-log.entity";
import { AuditService } from "./audit.service";
import { AuditController } from "./audit.controller";
import { AdminAuditHook } from "./hooks/admin-audit.hook";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  controllers: [AuditController],
  providers: [AuditService, AdminAuditHook],
  exports: [AuditService],
})
export class AuditModule {}
