package com.lawfirm.management.appointment.dto;
import com.lawfirm.management.appointment.AppointmentType;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime; import java.util.UUID;
public record CreateAppointmentRequest(@NotBlank @Size(max=180) String title,@Size(max=1000) String description,@NotNull LocalDateTime startsAt,@NotNull LocalDateTime endsAt,@Size(max=255) String location,AppointmentType type,UUID assignedUserId,UUID legalCaseId,UUID clientId) {}
