package com.lawfirm.management.security;
import com.lawfirm.management.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.*;

@Service @RequiredArgsConstructor
public class RefreshTokenService {
    private final RefreshTokenRepository repository;
    private final BCryptPasswordEncoder encoder;
    @Value("${jwt.refresh-token-expiration-ms}") private long expirationMs;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public String create(UUID userId) {
        byte[] bytes = new byte[32]; secureRandom.nextBytes(bytes);
        String raw = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        repository.save(RefreshToken.builder().userId(userId).tokenHash(encoder.encode(raw))
                .expiresAt(LocalDateTime.now().plusNanos(expirationMs * 1_000_000L)).build());
        return raw;
    }

    @Transactional
    public UUID validateAndRotate(String rawToken, UUID expectedUserId) {
        if (rawToken == null || rawToken.isBlank()) throw new UnauthorizedException("Refresh token inválido.");
        for (RefreshToken token : repository.findByUserIdAndRevokedFalse(expectedUserId)) {
            if (token.isValid() && encoder.matches(rawToken, token.getTokenHash())) {
                token.revoke(); repository.save(token); return expectedUserId;
            }
        }
        throw new UnauthorizedException("Refresh token inválido ou expirado.");
    }

    @Transactional
    public void revokeAllForUser(UUID userId) {
        repository.findByUserIdAndRevokedFalse(userId).forEach(t -> { t.revoke(); repository.save(t); });
    }
}
