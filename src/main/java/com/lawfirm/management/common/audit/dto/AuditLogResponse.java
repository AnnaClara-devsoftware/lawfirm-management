package com.lawfirm.management.common.audit.dto;
import com.lawfirm.management.common.audit.AuditAction; import java.time.LocalDateTime; import java.util.UUID;
public record AuditLogResponse(UUID id, UUID userId, AuditAction action, String entityName, String entityId, String description, LocalDateTime createdAt) {}
