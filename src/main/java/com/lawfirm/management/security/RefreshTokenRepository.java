package com.lawfirm.management.security;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    List<RefreshToken> findByUserIdAndRevokedFalse(UUID userId);
}
