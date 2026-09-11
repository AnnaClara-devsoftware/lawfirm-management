package com.lawfirm.management.deadline;

import com.lawfirm.management.common.BaseEntity;
import com.lawfirm.management.legalcase.LegalCase;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = false, of = "id")
@Entity @Table(name = "deadlines", indexes = {
        @Index(name = "idx_deadlines_case", columnList = "legal_case_id"),
        @Index(name = "idx_deadlines_due_date", columnList = "due_date"),
        @Index(name = "idx_deadlines_status", columnList = "status"),
        @Index(name = "idx_deadlines_priority", columnList = "priority")
})
public class Deadline extends BaseEntity {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DeadlineStatus status = DeadlineStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private DeadlinePriority priority = DeadlinePriority.NORMAL;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "legal_case_id", nullable = false)
    private LegalCase legalCase;

    @Version
    private Long version;

    @Transient
    public boolean isOverdue() {
        return status == DeadlineStatus.PENDING && dueDate != null && dueDate.isBefore(LocalDate.now());
    }
}
