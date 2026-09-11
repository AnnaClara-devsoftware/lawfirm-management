package com.lawfirm.management.common.audit;
import com.lawfirm.management.common.audit.dto.AuditLogResponse; import com.lawfirm.management.user.User; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.security.core.context.SecurityContextHolder; import org.springframework.stereotype.Service; import org.springframework.transaction.annotation.*; import java.time.LocalDateTime; import java.util.*;
@Service @RequiredArgsConstructor
public class AuditLogService {
 private final AuditLogRepository repository; private final AuditLogMapper mapper;
 @Transactional(propagation=Propagation.REQUIRES_NEW) public void record(AuditAction action,String entityName,String entityId,String description){ UUID userId=null; var a=SecurityContextHolder.getContext().getAuthentication(); if(a!=null&&a.getPrincipal() instanceof User u)userId=u.getId(); repository.save(AuditLog.builder().userId(userId).action(action).entityName(entityName).entityId(entityId).description(description).build()); }
 @Transactional(readOnly=true) public Page<AuditLogResponse> search(AuditAction action,String entityName,UUID userId,LocalDateTime from,LocalDateTime to,Pageable pageable){return repository.search(action,entityName,userId,from,to,pageable).map(mapper::toResponse);}
}
