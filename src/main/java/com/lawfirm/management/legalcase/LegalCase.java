package com.lawfirm.management.legalcase;

import com.lawfirm.management.client.Client;
import com.lawfirm.management.common.BaseEntity;
import com.lawfirm.management.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;

import java.time.LocalDate;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper = false, of = "id")
@Entity @Table(name = "legal_cases", indexes = {
        @Index(name = "idx_legal_cases_client", columnList = "client_id"),
        @Index(name = "idx_legal_cases_lawyer", columnList = "assigned_lawyer_id"),
        @Index(name = "idx_legal_cases_status", columnList = "status"),
        @Index(name = "idx_legal_cases_cnj", columnList = "cnj_number")
})
public class LegalCase extends BaseEntity {
    @Id @GeneratedValue @UuidGenerator
    private UUID id;

    @Column(name = "cnj_number", nullable = false, unique = true, length = 20)
    private String cnjNumber;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(length = 150)
    private String subject;

    @Column(length = 150)
    private String court;

    @Column(length = 150)
    private String tribunal;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private LegalCaseStatus status = LegalCaseStatus.ACTIVE;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private CasePriority priority = CasePriority.NORMAL;

    @Column(name = "opening_date", nullable = false)
    private LocalDate openingDate;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_lawyer_id")
    private User assignedLawyer;

    @Version
    private Long version;
}
