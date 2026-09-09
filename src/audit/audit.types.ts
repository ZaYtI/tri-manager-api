import { AuditAction, AuditTargetType } from "./audit.constants";

export interface AuditActor {
  id?: string | null;
  email?: string | null;
  impersonatedBy?: string | null;
}

export interface AuditEntry {
  action: AuditAction;
  actor?: AuditActor;
  targetType?: AuditTargetType;
  targetId?: string | null;
  targetLabel?: string | null;
  organizationId?: string | null;
  metadata?: Record<string, unknown> | null;
}
