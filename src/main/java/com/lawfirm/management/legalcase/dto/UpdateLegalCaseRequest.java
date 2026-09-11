package com.lawfirm.management.legalcase.dto;

import com.lawfirm.management.legalcase.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record UpdateLegalCaseRequest(
        @NotBlank @Size(min = 20, max = 20) String cnjNumber,
        @NotBlank @Size(max = 180) String title,
        @Size(max = 150) String subject,
        @Size(max = 150) String court,
        @Size(max = 150) String tribunal,
        @NotNull LegalCaseStatus status,
        @NotNull CasePriority priority,
        @NotNull LocalDate openingDate,
        LocalDate closingDate,
        @NotNull UUID clientId,
        UUID assignedLawyerId) {}
