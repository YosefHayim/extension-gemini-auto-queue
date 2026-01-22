import { AuditLog } from "../../models/AuditLog.js";

export async function createAuditLog(params: {
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  await AuditLog.create({
    userId: params.userId,
    action: params.action,
    resource: params.resource,
    resourceId: params.resourceId ?? null,
    details: params.details ?? {},
    ipAddress: params.ipAddress ?? null,
    userAgent: params.userAgent ?? null,
  });
}
