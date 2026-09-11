package com.lawfirm.management.notification;
import com.lawfirm.management.user.User; import jakarta.persistence.*; import lombok.*; import org.hibernate.annotations.UuidGenerator; import java.time.LocalDateTime; import java.util.UUID;
@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor @EqualsAndHashCode(of="id")
@Entity @Table(name="notifications",indexes={@Index(name="idx_notifications_user_read",columnList="user_id,is_read"),@Index(name="idx_notifications_created",columnList="created_at")})
public class Notification {
 @Id @GeneratedValue @UuidGenerator private UUID id;
 @ManyToOne(fetch=FetchType.LAZY,optional=false) @JoinColumn(name="user_id",nullable=false) private User user;
 @Enumerated(EnumType.STRING) @Column(nullable=false,length=30) private NotificationType type;
 @Column(nullable=false,length=180) private String title; @Column(nullable=false,length=1000) private String message;
 @Column(name="reference_type",length=40) private String referenceType; @Column(name="reference_id") private UUID referenceId;
 @Column(name="is_read",nullable=false) @Builder.Default private boolean read=false;
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
 @PrePersist void prePersist(){if(createdAt==null)createdAt=LocalDateTime.now();}
}
