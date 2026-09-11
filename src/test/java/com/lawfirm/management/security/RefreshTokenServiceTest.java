package com.lawfirm.management.security;

import com.lawfirm.management.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class RefreshTokenServiceTest {
    @Mock RefreshTokenRepository repository;
    private RefreshTokenService service;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(4);

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new RefreshTokenService(repository, encoder);
        ReflectionTestUtils.setField(service, "expirationMs", 604800000L);
    }

    @Test
    void shouldCreateTokenAndPersistHash() {
        UUID userId = UUID.randomUUID();
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        String raw = service.create(userId);
        ArgumentCaptor<RefreshToken> captor = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository).save(captor.capture());
        assertThat(raw).isNotBlank();
        assertThat(captor.getValue().getUserId()).isEqualTo(userId);
        assertThat(captor.getValue().getTokenHash()).isNotEqualTo(raw);
        assertThat(encoder.matches(raw, captor.getValue().getTokenHash())).isTrue();
    }

    @Test
    void shouldRotateMatchingActiveToken() {
        UUID userId = UUID.randomUUID();
        String raw = "refresh-secret";
        RefreshToken token = RefreshToken.builder().userId(userId).tokenHash(encoder.encode(raw))
                .expiresAt(java.time.LocalDateTime.now().plusDays(1)).revoked(false).build();
        when(repository.findByUserIdAndRevokedFalse(userId)).thenReturn(List.of(token));
        assertThat(service.validateAndRotate(raw, userId)).isEqualTo(userId);
        assertThat(token.isValid()).isFalse();
        verify(repository).save(token);
    }

    @Test
    void shouldRejectInvalidToken() {
        UUID userId = UUID.randomUUID();
        when(repository.findByUserIdAndRevokedFalse(userId)).thenReturn(List.of());
        assertThatThrownBy(() -> service.validateAndRotate("invalid", userId))
                .isInstanceOf(UnauthorizedException.class);
    }
}
