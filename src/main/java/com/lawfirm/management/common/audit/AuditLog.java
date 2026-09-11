package com.lawfirm.management.common.audit;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "audit_logs")
public class AuditLog {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;
    @Column(name = "user_id") private UUID userId;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 60) private AuditAction action;
    @Column(name = "entity_name", nullable = false, length = 60) private String entityName;
    @Column(name = "entity_id", length = 60) private String entityId;
    @Column(nullable = false, length = 500) private String description;
    @Column(name = "created_at", nullable = false) private LocalDateTime createdAt;

    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
