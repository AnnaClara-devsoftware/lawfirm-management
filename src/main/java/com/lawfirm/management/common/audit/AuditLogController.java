package com.lawfirm.management.common.audit;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.common.audit.dto.AuditLogResponse; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.format.annotation.DateTimeFormat; import org.springframework.http.*; import org.springframework.security.access.prepost.PreAuthorize; import org.springframework.web.bind.annotation.*; import java.time.LocalDateTime; import java.util.UUID;
@SecurityRequirement(name="bearerAuth")
@Tag(name="Auditoria", description="Consulta dos registros de auditoria do sistema.")
@RestController @RequestMapping("/api/audit-logs") @RequiredArgsConstructor @PreAuthorize("hasRole('ADMIN')")
public class AuditLogController { private final AuditLogService service;
 @Operation(summary="Consultar auditoria")
    @GetMapping public Page<AuditLogResponse> search(@RequestParam(required=false) AuditAction action,@RequestParam(required=false) String entityName,@RequestParam(required=false) UUID userId,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,@RequestParam(required=false) @DateTimeFormat(iso=DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,Pageable pageable){return service.search(action,entityName,userId,from,to,pageable);}
}
