package com.lawfirm.management.client;

import com.lawfirm.management.client.dto.*;
import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.audit.Auditable;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service @RequiredArgsConstructor
public class ClientService {
    private final ClientRepository repository;
    private final UserRepository userRepository;
    private final ClientMapper mapper;

    @Transactional(readOnly = true)
    public Page<ClientResponse> list(Pageable pageable, User currentUser) {
        return list(pageable, currentUser, null, null);
    }

    @Transactional(readOnly = true)
    public Page<ClientResponse> list(Pageable pageable, User currentUser, String search, Boolean active) {
        String normalizedSearch = normalize(search);
        Page<Client> page = currentUser.getRole() == Role.ADVOGADO
                ? repository.searchByAssignedLawyerId(currentUser.getId(), normalizedSearch, active, pageable)
                : repository.search(normalizedSearch, active, pageable);
        return page.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public ClientResponse findById(UUID id, User currentUser) {
        return mapper.toResponse(getAccessibleClient(id, currentUser));
    }

    @Transactional
    @Auditable(action = AuditAction.CREATE, entityName = "Client", description = "Cliente cadastrado.")
    public ClientResponse create(CreateClientRequest req, User currentUser) {
        String document = normalizeDocument(req.document());
        ensureDocumentAvailable(document, null);
        User lawyer = resolveLawyer(req.assignedLawyerId(), currentUser);
        Client client = Client.builder().name(req.name().trim()).document(document)
                .email(normalize(req.email())).phone(normalize(req.phone()))
                .street(normalize(req.street())).number(normalize(req.number()))
                .complement(normalize(req.complement())).neighborhood(normalize(req.neighborhood()))
                .city(normalize(req.city())).state(normalizeUpper(req.state())).zipCode(normalize(req.zipCode()))
                .assignedLawyer(lawyer).active(true).build();
        return mapper.toResponse(repository.save(client));
    }

    @Transactional
    @Auditable(action = AuditAction.UPDATE, entityName = "Client", description = "Cadastro de cliente atualizado.")
    public ClientResponse update(UUID id, UpdateClientRequest req, User currentUser) {
        Client client = getAccessibleClient(id, currentUser);
        String document = normalizeDocument(req.document());
        ensureDocumentAvailable(document, id);
        User lawyer = resolveLawyer(req.assignedLawyerId(), currentUser);
        client.setName(req.name().trim()); client.setDocument(document); client.setEmail(normalize(req.email()));
        client.setPhone(normalize(req.phone())); client.setStreet(normalize(req.street())); client.setNumber(normalize(req.number()));
        client.setComplement(normalize(req.complement())); client.setNeighborhood(normalize(req.neighborhood()));
        client.setCity(normalize(req.city())); client.setState(normalizeUpper(req.state())); client.setZipCode(normalize(req.zipCode()));
        client.setAssignedLawyer(lawyer);
        return mapper.toResponse(repository.save(client));
    }

    @Transactional
    @Auditable(action = AuditAction.DEACTIVATE, entityName = "Client", description = "Cliente desativado.")
    public void deactivate(UUID id, User currentUser) {
        Client client = getAccessibleClient(id, currentUser);
        client.setActive(false); repository.save(client);
    }

    @Transactional
    @Auditable(action = AuditAction.ACTIVATE, entityName = "Client", description = "Cliente ativado.")
    public void activate(UUID id, User currentUser) {
        Client client = getAccessibleClient(id, currentUser);
        client.setActive(true); repository.save(client);
    }

    private Client getAccessibleClient(UUID id, User user) {
        Client client = repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Cliente", id));
        if (user.getRole() == Role.ADVOGADO && (client.getAssignedLawyer() == null || !user.getId().equals(client.getAssignedLawyer().getId()))) {
            throw new ForbiddenOperationException("Você não possui acesso a este cliente.");
        }
        return client;
    }

    private User resolveLawyer(UUID lawyerId, User currentUser) {
        UUID effectiveId = lawyerId;
        if (currentUser.getRole() == Role.ADVOGADO) {
            if (effectiveId != null && !currentUser.getId().equals(effectiveId))
                throw new ForbiddenOperationException("Um advogado só pode atribuir o cliente a si mesmo.");
            effectiveId = currentUser.getId();
        }
        if (effectiveId == null) return null;
        final UUID resolvedId = effectiveId;
        User lawyer = userRepository.findById(resolvedId).orElseThrow(() -> ResourceNotFoundException.of("Advogado", resolvedId));
        if (lawyer.getRole() != Role.ADVOGADO || !lawyer.isActive()) throw new BusinessException("O usuário informado não é um advogado ativo.");
        return lawyer;
    }

    private void ensureDocumentAvailable(String document, UUID id) {
        if (document != null && !document.isBlank() && (id == null ? repository.existsByDocument(document) : repository.existsByDocumentAndIdNot(document, id)))
            throw new BusinessException("Já existe um cliente cadastrado com este documento.");
    }
    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalizeUpper(String value) { String v = normalize(value); return v == null ? null : v.toUpperCase(); }
    private String normalizeDocument(String value) { String v = normalize(value); return v == null ? null : v.replaceAll("\\D", ""); }
}
