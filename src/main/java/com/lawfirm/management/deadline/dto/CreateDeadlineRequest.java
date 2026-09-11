package com.lawfirm.management.deadline.dto;

import com.lawfirm.management.deadline.DeadlinePriority;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.util.UUID;

public record CreateDeadlineRequest(
        @NotBlank @Size(max = 180) String title,
        @Size(max = 1000) String description,
        @NotNull LocalDate dueDate,
        DeadlinePriority priority,
        @NotNull UUID legalCaseId) {}
