package com.lawfirm.management.deadline.dto;

import com.lawfirm.management.deadline.*;
import java.time.*;
import java.util.UUID;

public record DeadlineResponse(
        UUID id, String title, String description, LocalDate dueDate,
        DeadlineStatus status, DeadlinePriority priority, boolean overdue,
        LocalDate completedAt, UUID legalCaseId, String legalCaseCnj,
        String legalCaseTitle, UUID clientId, String clientName,
        UUID assignedLawyerId, String assignedLawyerName,
        LocalDateTime createdAt, LocalDateTime updatedAt) {}
