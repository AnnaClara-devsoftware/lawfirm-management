package com.lawfirm.management.legalcase.dto;

import com.lawfirm.management.legalcase.CasePriority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record CreateLegalCaseRequest(
        @NotBlank @Size(min = 20, max = 20) String cnjNumber,
        @NotBlank @Size(max = 180) String title,
        @Size(max = 150) String subject,
        @Size(max = 150) String court,
        @Size(max = 150) String tribunal,
        CasePriority priority,
        @NotNull LocalDate openingDate,
        @NotNull UUID clientId,
        UUID assignedLawyerId) {}
