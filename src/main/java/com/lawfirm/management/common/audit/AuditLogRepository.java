package com.lawfirm.management.common.audit;
import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.*; import org.springframework.data.repository.query.Param; import java.time.LocalDateTime; import java.util.*;
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
 @Query("select a from AuditLog a where (:action is null or a.action = :action) and (:entityName is null or lower(a.entityName)=lower(cast(:entityName as string))) and (:userId is null or a.userId=:userId) and (:from is null or a.createdAt >= :from) and (:to is null or a.createdAt <= :to)")
 Page<AuditLog> search(@Param("action") AuditAction action,@Param("entityName") String entityName,@Param("userId") UUID userId,@Param("from") LocalDateTime from,@Param("to") LocalDateTime to,Pageable pageable);
}
