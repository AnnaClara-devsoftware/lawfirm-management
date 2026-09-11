package com.lawfirm.management.deadline;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface DeadlineRepository extends JpaRepository<Deadline, UUID> {
    Page<Deadline> findAllByLegalCaseId(UUID legalCaseId, Pageable pageable);
    Page<Deadline> findAllByLegalCaseAssignedLawyerId(UUID lawyerId, Pageable pageable);
    Page<Deadline> findAllByStatus(DeadlineStatus status, Pageable pageable);
    Page<Deadline> findAllByLegalCaseAssignedLawyerIdAndStatus(UUID lawyerId, DeadlineStatus status, Pageable pageable);
    Page<Deadline> findAllByDueDateBeforeAndStatus(LocalDate date, DeadlineStatus status, Pageable pageable);
    Page<Deadline> findAllByLegalCaseAssignedLawyerIdAndDueDateBeforeAndStatus(UUID lawyerId, LocalDate date, DeadlineStatus status, Pageable pageable);
    long countByLegalCaseIdAndStatus(UUID legalCaseId, DeadlineStatus status);
    long countByDueDateBeforeAndStatus(LocalDate date, DeadlineStatus status);
    long countByStatus(DeadlineStatus status);
    long countByLegalCaseAssignedLawyerIdAndStatus(UUID lawyerId, DeadlineStatus status);
    long countByLegalCaseAssignedLawyerIdAndDueDateBeforeAndStatus(UUID lawyerId, LocalDate date, DeadlineStatus status);
}
