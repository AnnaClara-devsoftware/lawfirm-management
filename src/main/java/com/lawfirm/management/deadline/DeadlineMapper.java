package com.lawfirm.management.deadline;

import com.lawfirm.management.deadline.dto.DeadlineResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DeadlineMapper {
    @Mapping(target = "legalCaseId", source = "legalCase.id")
    @Mapping(target = "legalCaseCnj", source = "legalCase.cnjNumber")
    @Mapping(target = "legalCaseTitle", source = "legalCase.title")
    @Mapping(target = "clientId", source = "legalCase.client.id")
    @Mapping(target = "clientName", source = "legalCase.client.name")
    @Mapping(target = "assignedLawyerId", source = "legalCase.assignedLawyer.id")
    @Mapping(target = "assignedLawyerName", source = "legalCase.assignedLawyer.name")
    @Mapping(target = "overdue", expression = "java(entity.isOverdue())")
    DeadlineResponse toResponse(Deadline entity);
}
