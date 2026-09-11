package com.lawfirm.management.legalcase;

import com.lawfirm.management.client.*;
import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.audit.Auditable;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.legalcase.dto.*;
import com.lawfirm.management.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class LegalCaseService {
    private final LegalCaseRepository repository;
    private final ClientRepository clientRepository;
    private final UserRepository userRepository;
    private final LegalCaseMapper mapper;

    @Transactional(readOnly = true)
    public Page<LegalCaseResponse> list(Pageable pageable, User currentUser) {
        return list(pageable, currentUser, null, null);
    }

    @Transactional(readOnly = true)
    public Page<LegalCaseResponse> list(Pageable pageable, User currentUser, String search, LegalCaseStatus status) {
        String normalizedSearch = normalize(search);
        Page<LegalCase> page = currentUser.getRole() == Role.ADVOGADO
                ? repository.searchByAssignedLawyerId(currentUser.getId(), normalizedSearch, status, pageable)
                : repository.search(normalizedSearch, status, pageable);
        return page.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public LegalCaseResponse findById(UUID id, User currentUser) {
        return mapper.toResponse(getAccessibleCase(id, currentUser));
    }

    @Transactional
    @Auditable(action = AuditAction.CREATE, entityName = "LegalCase", description = "Processo jurídico cadastrado.")
    public LegalCaseResponse create(CreateLegalCaseRequest req, User currentUser) {
        String cnj = normalizeCnj(req.cnjNumber());
        validateCnj(cnj);
        ensureCnjAvailable(cnj, null);
        Client client = resolveClient(req.clientId());
        ensureClientCanReceiveCase(client);
        User lawyer = resolveLawyer(req.assignedLawyerId(), currentUser);
        LegalCase entity = LegalCase.builder().cnjNumber(cnj).title(req.title().trim())
                .subject(normalize(req.subject())).court(normalize(req.court())).tribunal(normalize(req.tribunal()))
                .priority(req.priority() == null ? CasePriority.NORMAL : req.priority())
                .status(LegalCaseStatus.ACTIVE).openingDate(req.openingDate())
                .client(client).assignedLawyer(lawyer).build();
        validateDates(entity.getOpeningDate(), null, entity.getStatus());
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    @Auditable(action = AuditAction.UPDATE, entityName = "LegalCase", description = "Processo jurídico atualizado.")
    public LegalCaseResponse update(UUID id, UpdateLegalCaseRequest req, User currentUser) {
        LegalCase entity = getAccessibleCase(id, currentUser);
        String cnj = normalizeCnj(req.cnjNumber());
        validateCnj(cnj);
        ensureCnjAvailable(cnj, id);
        Client client = resolveClient(req.clientId());
        ensureClientCanReceiveCase(client);
        User lawyer = resolveLawyer(req.assignedLawyerId(), currentUser);
        validateDates(req.openingDate(), req.closingDate(), req.status());
        entity.setCnjNumber(cnj); entity.setTitle(req.title().trim()); entity.setSubject(normalize(req.subject()));
        entity.setCourt(normalize(req.court())); entity.setTribunal(normalize(req.tribunal()));
        entity.setStatus(req.status()); entity.setPriority(req.priority()); entity.setOpeningDate(req.openingDate());
        entity.setClosingDate(req.closingDate()); entity.setClient(client); entity.setAssignedLawyer(lawyer);
        return mapper.toResponse(repository.save(entity));
    }

    private LegalCase getAccessibleCase(UUID id, User user) {
        LegalCase entity = repository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Processo", id));
        if (user.getRole() == Role.ADVOGADO && (entity.getAssignedLawyer() == null || !user.getId().equals(entity.getAssignedLawyer().getId())))
            throw new ForbiddenOperationException("Você não possui acesso a este processo.");
        return entity;
    }

    private Client resolveClient(UUID id) {
        return clientRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Cliente", id));
    }

    private void ensureClientCanReceiveCase(Client client) {
        if (!client.isActive()) throw new BusinessException("Não é possível vincular um processo a um cliente inativo.");
    }

    private User resolveLawyer(UUID lawyerId, User currentUser) {
        UUID effectiveId = lawyerId;
        if (currentUser.getRole() == Role.ADVOGADO) {
            if (effectiveId != null && !currentUser.getId().equals(effectiveId))
                throw new ForbiddenOperationException("Um advogado só pode atribuir o processo a si mesmo.");
            effectiveId = currentUser.getId();
        }
        if (effectiveId == null) return null;
        final UUID resolvedId = effectiveId;
        User lawyer = userRepository.findById(resolvedId).orElseThrow(() -> ResourceNotFoundException.of("Advogado", resolvedId));
        if (lawyer.getRole() != Role.ADVOGADO || !lawyer.isActive()) throw new BusinessException("O usuário informado não é um advogado ativo.");
        return lawyer;
    }

    private void ensureCnjAvailable(String cnj, UUID id) {
        if (id == null ? repository.existsByCnjNumber(cnj) : repository.existsByCnjNumberAndIdNot(cnj, id))
            throw new BusinessException("Já existe um processo cadastrado com este número CNJ.");
    }

    private void validateCnj(String cnj) {
        if (cnj.length() != 20) throw new BusinessException("O número CNJ deve conter exatamente 20 dígitos.");
    }

    private void validateDates(LocalDate opening, LocalDate closing, LegalCaseStatus status) {
        if (closing != null && closing.isBefore(opening)) throw new BusinessException("A data de encerramento não pode ser anterior à abertura.");
        if (status == LegalCaseStatus.CLOSED && closing == null) throw new BusinessException("Um processo encerrado deve possuir data de encerramento.");
        if (status != LegalCaseStatus.CLOSED && closing != null) throw new BusinessException("Somente processos encerrados podem possuir data de encerramento.");
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
    private String normalizeCnj(String value) { return value == null ? "" : value.replaceAll("\\D", ""); }
}
