package com.lawfirm.management.security;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UuidGenerator;
import java.time.LocalDateTime;
import java.util.UUID;
@Getter @Builder @NoArgsConstructor @AllArgsConstructor @Entity @Table(name="refresh_tokens")
public class RefreshToken {
    @Id @GeneratedValue @UuidGenerator private UUID id;
    @Column(name="user_id", nullable=false) private UUID userId;
    @Column(name="token_hash", nullable=false, unique=true, length=255) private String tokenHash;
    @Column(name="expires_at", nullable=false) private LocalDateTime expiresAt;
    @Column(nullable=false) @Builder.Default private boolean revoked=false;
    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    public boolean isValid() { return !revoked && expiresAt.isAfter(LocalDateTime.now()); }
    public void revoke() { revoked = true; }
    @PrePersist void prePersist() { if (createdAt == null) createdAt = LocalDateTime.now(); }
}
