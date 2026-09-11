package com.lawfirm.management.appointment;

import com.lawfirm.management.client.Client;
import com.lawfirm.management.common.BaseEntity;
import com.lawfirm.management.legalcase.LegalCase;
import com.lawfirm.management.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(callSuper=false, of="id")
@Entity @Table(name="appointments", indexes={
 @Index(name="idx_appointments_start", columnList="starts_at"),
 @Index(name="idx_appointments_user", columnList="assigned_user_id"),
 @Index(name="idx_appointments_case", columnList="legal_case_id"),
 @Index(name="idx_appointments_status", columnList="status")})
public class Appointment extends BaseEntity {
 @Id @GeneratedValue @UuidGenerator private UUID id;
 @Column(nullable=false,length=180) private String title;
 @Column(length=1000) private String description;
 @Column(name="starts_at",nullable=false) private LocalDateTime startsAt;
 @Column(name="ends_at",nullable=false) private LocalDateTime endsAt;
 @Column(length=255) private String location;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) @Builder.Default private AppointmentType type=AppointmentType.MEETING;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=20) @Builder.Default private AppointmentStatus status=AppointmentStatus.SCHEDULED;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="assigned_user_id",nullable=false) private User assignedUser;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="legal_case_id") private LegalCase legalCase;
 @ManyToOne(fetch=FetchType.LAZY) @JoinColumn(name="client_id") private Client client;
 @Version private Long version;
}
