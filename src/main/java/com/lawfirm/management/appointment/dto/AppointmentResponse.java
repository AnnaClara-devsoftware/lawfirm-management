package com.lawfirm.management.appointment.dto;
import com.lawfirm.management.appointment.*; import java.time.LocalDateTime; import java.util.UUID;
public record AppointmentResponse(UUID id,String title,String description,LocalDateTime startsAt,LocalDateTime endsAt,String location,AppointmentType type,AppointmentStatus status,UUID assignedUserId,String assignedUserName,UUID legalCaseId,UUID clientId) {}
