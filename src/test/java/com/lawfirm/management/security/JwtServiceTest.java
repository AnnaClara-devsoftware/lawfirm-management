package com.lawfirm.management.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {
    private JwtService service;

    @BeforeEach
    void setUp() {
        service = new JwtService();
        ReflectionTestUtils.setField(service, "secret", "01234567890123456789012345678901");
        ReflectionTestUtils.setField(service, "accessExpirationMs", 900000L);
        service.init();
    }

    @Test
    void shouldGenerateAndValidateToken() {
        String token = service.generateAccessToken("anna@example.com");
        assertThat(service.extractUsername(token)).isEqualTo("anna@example.com");
        assertThat(service.isTokenValid(token, "anna@example.com")).isTrue();
        assertThat(service.isTokenValid(token, "other@example.com")).isFalse();
    }
}
