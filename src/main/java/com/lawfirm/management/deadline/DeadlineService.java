package com.lawfirm.management.deadline;

import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.audit.Auditable;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.deadline.dto.*;
import com.lawfirm.management.legalcase.LegalCase;
import com.lawfirm.management.legalcase.LegalCaseRepository;
import com.lawfirm.management.legalcase.LegalCaseStatus;
import com.lawfirm.management.user.Role;
import com.lawfirm.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.UUID;

@Service @RequiredArgsConstructor
public class DeadlineService {
    private final DeadlineRepository repository;
    private final LegalCaseRepository legalCaseRepository;
    private final DeadlineMapper mapper;

    @Transactional(readOnly = true)
    public Page<DeadlineResponse> list(UUID legalCaseId, DeadlineStatus status, boolean overdue,
                                       Pageable pageable, User currentUser) {
        Page<Deadline> page;
        if (legalCaseId != null) {
            LegalCase legalCase = getAccessibleCase(legalCaseId, currentUser);
            page = repository.findAllByLegalCaseId(legalCase.getId(), pageable);
        } else if (overdue) {
            page = currentUser.getRole() == Role.ADVOGADO
                    ? repository.findAllByLegalCaseAssignedLawyerIdAndDueDateBeforeAndStatus(
                        currentUser.getId(), LocalDate.now(), DeadlineStatus.PENDING, pageable)
                    : repository.findAllByDueDateBeforeAndStatus(LocalDate.now(), DeadlineStatus.PENDING, pageable);
        } else if (status != null) {
            page = currentUser.getRole() == Role.ADVOGADO
                    ? repository.findAllByLegalCaseAssignedLawyerIdAndStatus(currentUser.getId(), status, pageable)
                    : repository.findAllByStatus(status, pageable);
        } else {
            page = currentUser.getRole() == Role.ADVOGADO
                    ? repository.findAllByLegalCaseAssignedLawyerId(currentUser.getId(), pageable)
                    : repository.findAll(pageable);
        }
        return page.map(mapper::toResponse);
    }

    @Transactional(readOnly = true)
    public DeadlineResponse findById(UUID id, User currentUser) {
        return mapper.toResponse(getAccessibleDeadline(id, currentUser));
    }

    @Transactional
    @Auditable(action = AuditAction.CREATE, entityName = "Deadline", description = "Prazo processual cadastrado.")
    public DeadlineResponse create(CreateDeadlineRequest req, User currentUser) {
        validateDueDate(req.dueDate());
        LegalCase legalCase = getAccessibleCase(req.legalCaseId(), currentUser);
        ensureCaseCanReceiveDeadline(legalCase);
        Deadline entity = Deadline.builder()
                .title(req.title().trim()).description(normalize(req.description()))
                .dueDate(req.dueDate()).priority(req.priority() == null ? DeadlinePriority.NORMAL : req.priority())
                .status(DeadlineStatus.PENDING).legalCase(legalCase).build();
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    @Auditable(action = AuditAction.UPDATE, entityName = "Deadline", description = "Prazo processual atualizado.")
    public DeadlineResponse update(UUID id, UpdateDeadlineRequest req, User currentUser) {
        Deadline entity = getAccessibleDeadline(id, currentUser);
        validateDueDate(req.dueDate());
        LegalCase legalCase = getAccessibleCase(req.legalCaseId(), currentUser);
        ensureCaseCanReceiveDeadline(legalCase);
        validateStatusTransition(req.status(), req.dueDate());
        entity.setTitle(req.title().trim());
        entity.setDescription(normalize(req.description()));
        entity.setDueDate(req.dueDate());
        entity.setStatus(req.status());
        entity.setPriority(req.priority());
        entity.setLegalCase(legalCase);
        entity.setCompletedAt(req.status() == DeadlineStatus.COMPLETED ?
                (entity.getCompletedAt() == null ? LocalDate.now() : entity.getCompletedAt()) : null);
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    @Auditable(action = AuditAction.COMPLETE, entityName = "Deadline", description = "Prazo processual concluído.")
    public DeadlineResponse complete(UUID id, User currentUser) {
        Deadline entity = getAccessibleDeadline(id, currentUser);
        if (entity.getStatus() == DeadlineStatus.CANCELLED)
            throw new BusinessException("Um prazo cancelado não pode ser concluído.");
        if (entity.getStatus() == DeadlineStatus.COMPLETED)
            throw new BusinessException("Este prazo já está concluído.");
        entity.setStatus(DeadlineStatus.COMPLETED);
        entity.setCompletedAt(LocalDate.now());
        return mapper.toResponse(repository.save(entity));
    }

    @Transactional
    @Auditable(action = AuditAction.UPDATE, entityName = "Deadline", description = "Prazo processual cancelado.")
    public DeadlineResponse cancel(UUID id, User currentUser) {
        Deadline entity = getAccessibleDeadline(id, currentUser);
        if (entity.getStatus() == DeadlineStatus.COMPLETED)
            throw new BusinessException("Um prazo concluído não pode ser cancelado.");
        if (entity.getStatus() == DeadlineStatus.CANCELLED)
            throw new BusinessException("Este prazo já está cancelado.");
        entity.setStatus(DeadlineStatus.CANCELLED);
        entity.setCompletedAt(null);
        return mapper.toResponse(repository.save(entity));
    }

    private Deadline getAccessibleDeadline(UUID id, User user) {
        Deadline deadline = repository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Prazo", id));
        ensureAccess(deadline.getLegalCase(), user);
        return deadline;
    }

    private LegalCase getAccessibleCase(UUID id, User user) {
        LegalCase legalCase = legalCaseRepository.findById(id)
                .orElseThrow(() -> ResourceNotFoundException.of("Processo", id));
        ensureAccess(legalCase, user);
        return legalCase;
    }

    private void ensureAccess(LegalCase legalCase, User user) {
        if (user.getRole() == Role.ADVOGADO &&
                (legalCase.getAssignedLawyer() == null || !user.getId().equals(legalCase.getAssignedLawyer().getId())))
            throw new ForbiddenOperationException("Você não possui acesso a este prazo/processo.");
    }

    private void ensureCaseCanReceiveDeadline(LegalCase legalCase) {
        if (legalCase.getStatus() == LegalCaseStatus.CLOSED)
            throw new BusinessException("Não é possível criar ou alterar prazo de um processo encerrado.");
    }

    private void validateDueDate(LocalDate dueDate) {
        if (dueDate == null) throw new BusinessException("A data de vencimento é obrigatória.");
    }

    private void validateStatusTransition(DeadlineStatus status, LocalDate dueDate) {
        if (status == DeadlineStatus.COMPLETED && dueDate == null)
            throw new BusinessException("Um prazo concluído deve possuir data de vencimento.");
    }

    private String normalize(String value) { return value == null || value.isBlank() ? null : value.trim(); }
}
