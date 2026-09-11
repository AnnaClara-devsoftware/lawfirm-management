package com.lawfirm.management.legalcase;

import com.lawfirm.management.legalcase.dto.LegalCaseResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LegalCaseMapper {
    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", source = "client.name")
    @Mapping(target = "assignedLawyerId", source = "assignedLawyer.id")
    @Mapping(target = "assignedLawyerName", source = "assignedLawyer.name")
    LegalCaseResponse toResponse(LegalCase entity);
}
