package com.lawfirm.management.user;

import com.lawfirm.management.common.exception.BusinessException;
import com.lawfirm.management.user.dto.ChangePasswordRequest;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class UserServiceTest {
    @Mock UserRepository repository;
    @Mock UserMapper mapper;
    @Mock PasswordEncoder passwordEncoder;
    private UserService service;

    @BeforeEach void setUp() {
        MockitoAnnotations.openMocks(this);
        service = new UserService(repository, mapper, passwordEncoder);
    }

    @Test void shouldRejectWrongCurrentPassword() {
        UUID id=UUID.randomUUID();
        User user=User.builder().id(id).password("encoded-old").name("Anna").email("anna@example.com").role(Role.ADVOGADO).build();
        when(repository.findById(id)).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("wrong", "encoded-old")).thenReturn(false);
        assertThatThrownBy(() -> service.changePassword(id,new ChangePasswordRequest("wrong","new-password")))
                .isInstanceOf(BusinessException.class).hasMessage("Senha atual inválida.");
        verify(repository,never()).save(any());
    }

    @Test
    void shouldRejectChangingLastActiveAdminRole() {
        UUID id = UUID.randomUUID();
        User admin = User.builder().id(id).password("encoded").name("Admin").email("admin@example.com")
                .role(Role.ADMIN).active(true).build();
        when(repository.findById(id)).thenReturn(java.util.Optional.of(admin));
        when(repository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.updateRole(id, new com.lawfirm.management.user.dto.UpdateRoleRequest(Role.ADVOGADO)))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Não é permitido remover o último administrador ativo.");
        verify(repository, never()).save(any());
    }

    @Test
    void shouldRejectDeactivatingLastActiveAdmin() {
        UUID id = UUID.randomUUID();
        User admin = User.builder().id(id).password("encoded").name("Admin").email("admin@example.com")
                .role(Role.ADMIN).active(true).build();
        when(repository.findById(id)).thenReturn(java.util.Optional.of(admin));
        when(repository.countByRoleAndActiveTrue(Role.ADMIN)).thenReturn(1L);

        assertThatThrownBy(() -> service.deactivate(id))
                .isInstanceOf(BusinessException.class)
                .hasMessage("Não é permitido desativar o último administrador ativo.");
        verify(repository, never()).save(any());
    }

    @Test
    void shouldChangePasswordWhenCurrentPasswordIsCorrect() {
        UUID id = UUID.randomUUID();
        User user = User.builder().id(id).password("encoded-old").name("Anna").email("anna@example.com")
                .role(Role.ADVOGADO).active(true).build();
        when(repository.findById(id)).thenReturn(java.util.Optional.of(user));
        when(passwordEncoder.matches("old-password", "encoded-old")).thenReturn(true);
        when(passwordEncoder.matches("new-password", "encoded-old")).thenReturn(false);
        when(passwordEncoder.encode("new-password")).thenReturn("encoded-new");

        service.changePassword(id, new ChangePasswordRequest("old-password", "new-password"));

        assertThat(user.getPassword()).isEqualTo("encoded-new");
        verify(repository).save(user);
    }

}
