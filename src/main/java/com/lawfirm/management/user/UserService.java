package com.lawfirm.management.user;

import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.audit.Auditable;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.user.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class UserService {
    private final UserRepository repository;
    private final UserMapper mapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly=true)
    public Page<UserResponse> listAll(Pageable pageable) { return repository.findAll(pageable).map(mapper::toResponse); }
    @Transactional(readOnly=true)
    public UserResponse findById(UUID id) { return mapper.toResponse(getOrThrow(id)); }

    @Transactional
    @Auditable(action=AuditAction.UPDATE, entityName="User", description="Perfil de usuário atualizado.")
    public UserResponse updateProfile(UUID id, UpdateProfileRequest req) {
        User user = getOrThrow(id); user.setName(req.name().trim()); user.setPhone(req.phone()); return mapper.toResponse(repository.save(user));
    }

    @Transactional
    @Auditable(action=AuditAction.PASSWORD_CHANGE, entityName="User", description="Senha de usuário alterada.")
    public void changePassword(UUID id, ChangePasswordRequest req) {
        User user = getOrThrow(id);
        if (!passwordEncoder.matches(req.currentPassword(), user.getPassword())) throw new BusinessException("Senha atual inválida.");
        if (passwordEncoder.matches(req.newPassword(), user.getPassword())) throw new BusinessException("A nova senha deve ser diferente da atual.");
        user.setPassword(passwordEncoder.encode(req.newPassword())); repository.save(user);
    }

    @Transactional
    @Auditable(action=AuditAction.UPDATE, entityName="User", description="Perfil de acesso do usuário alterado.")
    public UserResponse updateRole(UUID id, UpdateRoleRequest req) {
        User user=getOrThrow(id);
        if (user.getRole() == req.role()) return mapper.toResponse(user);
        if (user.getRole() == Role.ADMIN && req.role() != Role.ADMIN && countActiveAdmins() <= 1) {
            throw new BusinessException("Não é permitido remover o último administrador ativo.");
        }
        user.setRole(req.role());
        return mapper.toResponse(repository.save(user));
    }

    @Transactional
    @Auditable(action=AuditAction.DEACTIVATE, entityName="User", description="Usuário desativado.")
    public void deactivate(UUID id) {
        User user=getOrThrow(id);
        if (!user.isActive()) return;
        if (user.getRole() == Role.ADMIN && countActiveAdmins() <= 1) {
            throw new BusinessException("Não é permitido desativar o último administrador ativo.");
        }
        user.setActive(false);
        repository.save(user);
    }

    @Transactional
    @Auditable(action=AuditAction.ACTIVATE, entityName="User", description="Usuário ativado.")
    public void activate(UUID id) { User user=getOrThrow(id); if (user.isActive()) return; user.setActive(true); repository.save(user); }

    @Transactional(readOnly=true)
    public long countActiveAdmins() { return repository.countByRoleAndActiveTrue(Role.ADMIN); }

    @Transactional(readOnly=true)
    public User getOrThrow(UUID id) { return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Usuário", id)); }
}
