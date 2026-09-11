import { http } from "@/services/api";
import type { AuditAction, AuditLogResponse, Page } from "@/types";

export interface AuditLogListParams {
  page: number;
  size: number;
  action?: AuditAction | "";
  entityName?: string;
  userId?: string;
  from?: string;
  to?: string;
}

export const auditService = {
  search: ({ page, size, action, entityName, userId, from, to }: AuditLogListParams) =>
    http
      .get<Page<AuditLogResponse>>("/audit-logs", {
        params: {
          page,
          size,
          action: action || undefined,
          entityName: entityName || undefined,
          userId: userId || undefined,
          from: from || undefined,
          to: to || undefined,
        },
      })
      .then((r) => r.data),
};
