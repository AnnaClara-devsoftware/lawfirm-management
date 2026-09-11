package com.lawfirm.management.legalcase.dto;

import com.lawfirm.management.legalcase.*;
import java.time.*;
import java.util.UUID;

public record LegalCaseResponse(
        UUID id, String cnjNumber, String title, String subject, String court, String tribunal,
        LegalCaseStatus status, CasePriority priority, LocalDate openingDate, LocalDate closingDate,
        UUID clientId, String clientName, UUID assignedLawyerId, String assignedLawyerName,
        LocalDateTime createdAt, LocalDateTime updatedAt) {}
