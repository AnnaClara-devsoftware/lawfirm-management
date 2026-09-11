package com.lawfirm.management.user;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.user.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@SecurityRequirement(name="bearerAuth")
@Tag(name="Usuários", description="Administração de usuários e perfis.")
@RestController @RequestMapping("/api/users") @RequiredArgsConstructor
public class UserController {
    private final UserService service;
    @Operation(summary="Listar usuários")
    @GetMapping @PreAuthorize("hasRole('ADMIN')") public Page<UserResponse> list(Pageable pageable) { return service.listAll(pageable); }
    @Operation(summary="Consultar meu perfil")
    @GetMapping("/me") public UserResponse me(@AuthenticationPrincipal User user) { return service.findById(user.getId()); }
    @Operation(summary="Consultar usuário")
    @GetMapping("/{id}") @PreAuthorize("hasRole('ADMIN') or #id.equals(authentication.principal.id)") public UserResponse find(@PathVariable UUID id) { return service.findById(id); }
    @Operation(summary="Atualizar perfil")
    @PutMapping("/{id}") @PreAuthorize("hasRole('ADMIN') or #id.equals(authentication.principal.id)") public UserResponse update(@PathVariable UUID id,@Valid @RequestBody UpdateProfileRequest req){return service.updateProfile(id,req);}
    @Operation(summary="Alterar senha")
    @PatchMapping("/{id}/password") @PreAuthorize("#id.equals(authentication.principal.id)") @ResponseStatus(HttpStatus.NO_CONTENT) public void password(@PathVariable UUID id,@Valid @RequestBody ChangePasswordRequest req){service.changePassword(id,req);}
    @Operation(summary="Alterar perfil de acesso")
    @PatchMapping("/{id}/role") @PreAuthorize("hasRole('ADMIN')") public UserResponse role(@PathVariable UUID id,@Valid @RequestBody UpdateRoleRequest req){return service.updateRole(id,req);}
    @Operation(summary="Desativar usuário")
    @PatchMapping("/{id}/deactivate") @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.NO_CONTENT) public void deactivate(@PathVariable UUID id){service.deactivate(id);}
    @Operation(summary="Ativar usuário")
    @PatchMapping("/{id}/activate") @PreAuthorize("hasRole('ADMIN')") @ResponseStatus(HttpStatus.NO_CONTENT) public void activate(@PathVariable UUID id){service.activate(id);}
}
