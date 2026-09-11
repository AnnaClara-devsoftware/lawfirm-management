package com.lawfirm.management.config;

import com.lawfirm.management.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class AdminBootstrapConfig {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${bootstrap.admin.enabled:false}") private boolean enabled;
    @Value("${bootstrap.admin.name:Administrador}") private String name;
    @Value("${bootstrap.admin.email:admin@lawfirm.local}") private String email;
    @Value("${bootstrap.admin.password:}") private String password;

    @Bean
    CommandLineRunner bootstrapAdmin() {
        return args -> {
            if (!enabled || password == null || password.length() < 8) return;
            String normalized = email.trim().toLowerCase();
            if (userRepository.existsByEmailIgnoreCase(normalized)) return;
            userRepository.save(User.builder().name(name.trim()).email(normalized)
                    .password(passwordEncoder.encode(password)).role(Role.ADMIN).active(true).build());
        };
    }
}
