package com.lawfirm.management.user;

import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.exception.BusinessException;
import com.lawfirm.management.security.*;
import com.lawfirm.management.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service @RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final UserMapper userMapper;

    @Transactional
    @Auditable(action=AuditAction.CREATE, entityName="User", description="Usuário registrado.")
    public AuthResponse register(RegisterRequest req) {
        String email=req.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) throw new BusinessException("E-mail já cadastrado.");
        if (req.role()==Role.ADMIN) throw new BusinessException("O cadastro público não pode criar usuários ADMIN.");
        User user=User.builder().name(req.name().trim()).email(email).password(passwordEncoder.encode(req.password()))
                .phone(req.phone()).role(req.role()).active(true).build();
        return buildAuthResponse(userRepository.save(user));
    }

    @Transactional
    @Auditable(action=AuditAction.LOGIN, entityName="User", description="Login realizado.")
    public AuthResponse login(LoginRequest req) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(req.email().trim().toLowerCase(), req.password()));
        return buildAuthResponse(userRepository.findByEmailIgnoreCase(req.email().trim()).orElseThrow(() -> new BusinessException("Usuário não encontrado.")));
    }

    @Transactional
    public AuthResponse refresh(String refreshToken, String expiredAccessToken) {
        String username=jwtService.extractUsernameAllowExpired(expiredAccessToken);
        User user=(User) userDetailsService.loadUserByUsername(username);
        refreshTokenService.validateAndRotate(refreshToken,user.getId());
        return buildAuthResponse(user);
    }

    @Transactional
    @Auditable(action=AuditAction.LOGOUT, entityName="User", description="Logout realizado; tokens de sessão revogados.")
    public void logout(User user) { refreshTokenService.revokeAllForUser(user.getId()); }

    private AuthResponse buildAuthResponse(User user) {
        if (!user.isActive()) throw new BusinessException("Usuário inativo.");
        return new AuthResponse(jwtService.generateAccessToken(user.getUsername()), refreshTokenService.create(user.getId()), userMapper.toResponse(user));
    }
}
