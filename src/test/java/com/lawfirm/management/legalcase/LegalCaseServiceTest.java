package com.lawfirm.management.legalcase;

import com.lawfirm.management.client.*;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.legalcase.dto.*;
import com.lawfirm.management.user.*;
import org.junit.jupiter.api.*;
import org.mockito.*;
import org.springframework.data.domain.*;
import java.time.LocalDate;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class LegalCaseServiceTest {
    @Mock LegalCaseRepository repository;
    @Mock ClientRepository clientRepository;
    @Mock UserRepository userRepository;
    @Mock LegalCaseMapper mapper;
    @InjectMocks LegalCaseService service;

    @BeforeEach void setUp() { MockitoAnnotations.openMocks(this); }

    @Test void rejectsDuplicateCnj() {
        User admin = user(Role.ADMIN); when(repository.existsByCnjNumber("12345678901234567890")).thenReturn(true);
        var req = request("12345.678901/2345-67");
        assertThrows(BusinessException.class, () -> service.create(req, admin));
        verify(repository, never()).save(any());
    }

    @Test void lawyerCanOnlyAssignToSelf() {
        User lawyer = user(Role.ADVOGADO); UUID other = UUID.randomUUID();
        when(repository.existsByCnjNumber(anyString())).thenReturn(false);
        when(clientRepository.findById(any())).thenReturn(Optional.of(client()));
        var req = new CreateLegalCaseRequest("12345.678901/2345-67", "Ação", null, null, null, null, LocalDate.now(), UUID.randomUUID(), other);
        assertThrows(ForbiddenOperationException.class, () -> service.create(req, lawyer));
    }

    @Test void rejectsInactiveClient() {
        User admin = user(Role.ADMIN); Client c = client(); c.setActive(false);
        when(repository.existsByCnjNumber(anyString())).thenReturn(false); when(clientRepository.findById(any())).thenReturn(Optional.of(c));
        assertThrows(BusinessException.class, () -> service.create(request("12345.678901/2345-67"), admin));
    }

    @Test void rejectsClosedCaseWithoutClosingDate() {
        User admin = user(Role.ADMIN); when(repository.existsByCnjNumber(anyString())).thenReturn(false); when(clientRepository.findById(any())).thenReturn(Optional.of(client()));
        var req = new UpdateLegalCaseRequest("12345.678901/2345-67", "Ação", null, null, null, LegalCaseStatus.CLOSED, CasePriority.NORMAL, LocalDate.now(), null, UUID.randomUUID(), null);
        assertThrows(BusinessException.class, () -> service.update(UUID.randomUUID(), req, admin));
    }

    private CreateLegalCaseRequest request(String cnj) { return new CreateLegalCaseRequest(cnj, "Ação trabalhista", null, null, null, CasePriority.NORMAL, LocalDate.now(), UUID.randomUUID(), null); }
    private User user(Role role) { return User.builder().id(UUID.randomUUID()).name("Usuário").email("u@test.com").role(role).active(true).password("x").build(); }
    private Client client() { return Client.builder().id(UUID.randomUUID()).name("Cliente").active(true).build(); }
}
