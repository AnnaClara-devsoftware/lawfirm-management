package com.lawfirm.management.user;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.user.dto.*;
import com.lawfirm.management.common.exception.UnauthorizedException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name="Autenticação", description="Registro, login, renovação e encerramento de sessões.")
@RestController @RequestMapping("/api/auth") @RequiredArgsConstructor
public class AuthController {
    private final AuthService service;
    @Operation(summary="Registrar usuário")
    @PostMapping("/register") public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest req) { return ResponseEntity.status(HttpStatus.CREATED).body(service.register(req)); }
    @Operation(summary="Autenticar usuário")
    @PostMapping("/login") public AuthResponse login(@Valid @RequestBody LoginRequest req) { return service.login(req); }
    @Operation(summary="Renovar tokens de acesso")
    @PostMapping("/refresh") public AuthResponse refresh(@Valid @RequestBody RefreshRequest req, @RequestHeader(value="Authorization", required=false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ") || authorization.length() <= 7) {
            throw new UnauthorizedException("Access token expirado é obrigatório no header Authorization.");
        }
        return service.refresh(req.refreshToken(), authorization.substring(7));
    }
    @Operation(summary="Encerrar sessão")
    @PostMapping("/logout") @ResponseStatus(HttpStatus.NO_CONTENT) public void logout(@AuthenticationPrincipal User user) { service.logout(user); }
}
