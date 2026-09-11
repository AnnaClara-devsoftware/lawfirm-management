package com.lawfirm.management.client;

import com.lawfirm.management.client.dto.*;
import com.lawfirm.management.common.exception.BusinessException;
import com.lawfirm.management.common.exception.ForbiddenOperationException;
import com.lawfirm.management.user.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.springframework.data.domain.*;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(org.mockito.junit.jupiter.MockitoExtension.class)
class ClientServiceTest {
    @Mock ClientRepository repository;
    @Mock UserRepository userRepository;
    @Mock ClientMapper mapper;
    @InjectMocks ClientService service;

    private User admin() { return User.builder().id(UUID.randomUUID()).name("Admin").email("admin@test.com").role(Role.ADMIN).active(true).build(); }
    private User lawyer(UUID id) { return User.builder().id(id).name("Advogado").email("adv@test.com").role(Role.ADVOGADO).active(true).build(); }

    @Test
    void shouldCreateClientAndAssignActiveLawyer() {
        User admin = admin(); UUID lawyerId = UUID.randomUUID(); User lawyer = lawyer(lawyerId);
        CreateClientRequest req = new CreateClientRequest(" Maria Silva ", "123.456.789-09", "maria@test.com", null, null, null, null, null, "Joao Pessoa", "pb", "58000000", lawyerId);
        when(repository.existsByDocument("12345678909")).thenReturn(false);
        when(userRepository.findById(lawyerId)).thenReturn(Optional.of(lawyer));
        when(repository.save(any(Client.class))).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any())).thenReturn(mock(ClientResponse.class));

        assertNotNull(service.create(req, admin));
        ArgumentCaptor<Client> captor = ArgumentCaptor.forClass(Client.class);
        verify(repository).save(captor.capture());
        assertEquals("Maria Silva", captor.getValue().getName());
        assertEquals("12345678909", captor.getValue().getDocument());
        assertEquals(lawyerId, captor.getValue().getAssignedLawyer().getId());
    }

    @Test
    void shouldRejectDuplicateDocument() {
        User admin = admin();
        CreateClientRequest req = new CreateClientRequest("Maria", "12345678909", null, null, null, null, null, null, null, null, null, null);
        when(repository.existsByDocument("12345678909")).thenReturn(true);
        assertThrows(BusinessException.class, () -> service.create(req, admin));
        verify(repository, never()).save(any());
    }

    @Test
    void lawyerCanOnlyAssignClientToSelf() {
        UUID id = UUID.randomUUID(); User lawyer = lawyer(id);
        CreateClientRequest req = new CreateClientRequest("Maria", null, null, null, null, null, null, null, null, null, null, UUID.randomUUID());
        assertThrows(ForbiddenOperationException.class, () -> service.create(req, lawyer));
    }

    @Test
    void lawyerCannotAccessAnotherLawyersClient() {
        UUID currentId = UUID.randomUUID(); User current = lawyer(currentId);
        User owner = lawyer(UUID.randomUUID());
        Client client = Client.builder().id(UUID.randomUUID()).name("Maria").assignedLawyer(owner).build();
        when(repository.findById(client.getId())).thenReturn(Optional.of(client));
        assertThrows(ForbiddenOperationException.class, () -> service.findById(client.getId(), current));
    }

    @Test
    void lawyerListShouldBeRestrictedToAssignedClients() {
        User current = lawyer(UUID.randomUUID());
        Page<Client> page = new PageImpl<>(List.of());
        when(repository.findAllByAssignedLawyerId(eq(current.getId()), any(Pageable.class))).thenReturn(page);
        when(mapper.toResponse(any())).thenReturn(mock(ClientResponse.class));
        service.list(PageRequest.of(0, 20), current);
        verify(repository).findAllByAssignedLawyerId(current.getId(), PageRequest.of(0, 20));
        verify(repository, never()).findAll(any(Pageable.class));
    }
}
