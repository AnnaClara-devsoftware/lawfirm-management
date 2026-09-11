package com.lawfirm.management.appointment;
import com.lawfirm.management.appointment.dto.AppointmentResponse; import org.mapstruct.Mapper; import org.mapstruct.Mapping;
@Mapper(componentModel="spring") public interface AppointmentMapper {
 @Mapping(target="assignedUserId",source="assignedUser.id") @Mapping(target="assignedUserName",source="assignedUser.name")
 @Mapping(target="legalCaseId",source="legalCase.id") @Mapping(target="clientId",source="client.id") AppointmentResponse toResponse(Appointment entity);
}
