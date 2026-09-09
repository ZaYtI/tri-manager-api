import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { paginate, Paginated, PaginateQuery } from "nestjs-paginate";

import { AuditLogEntity } from "./entities/audit-log.entity";
import { AuditEntry } from "./audit.types";

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectRepository(AuditLogEntity)
    private readonly logs: Repository<AuditLogEntity>,
  ) {}

  async record(entry: AuditEntry): Promise<void> {
    try {
      await this.logs.save(
        this.logs.create({
          action: entry.action,
          actorId: entry.actor?.id ?? null,
          actorEmail: entry.actor?.email ?? null,
          impersonatedBy: entry.actor?.impersonatedBy ?? null,
          targetType: entry.targetType ?? null,
          targetId: entry.targetId ?? null,
          targetLabel: entry.targetLabel ?? null,
          organizationId: entry.organizationId ?? null,
          metadata: entry.metadata ?? null,
        }),
      );
    } catch (error) {
      this.logger.error(
        `Échec d'écriture d'un événement d'audit (${entry.action})`,
        error as Error,
      );
    }
  }

  findAll(query: PaginateQuery): Promise<Paginated<AuditLogEntity>> {
    return paginate(query, this.logs, {
      sortableColumns: ["createdAt", "action"],
      searchableColumns: ["action", "actorEmail", "targetLabel"],
      filterableColumns: {
        action: true,
        actorId: true,
        targetType: true,
        targetId: true,
        organizationId: true,
      },
      defaultSortBy: [["createdAt", "DESC"]],
      maxLimit: 100,
    });
  }
}
