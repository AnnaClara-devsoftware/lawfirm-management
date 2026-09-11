package com.lawfirm.management.common.audit;
import com.lawfirm.management.common.audit.dto.AuditLogResponse; import org.mapstruct.Mapper;
@Mapper(componentModel="spring") public interface AuditLogMapper { AuditLogResponse toResponse(AuditLog entity); }
