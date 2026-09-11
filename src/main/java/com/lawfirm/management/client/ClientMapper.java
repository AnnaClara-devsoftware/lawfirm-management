package com.lawfirm.management.client;

import com.lawfirm.management.client.dto.ClientResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ClientMapper {
    @Mapping(target = "assignedLawyerId", source = "assignedLawyer.id")
    @Mapping(target = "assignedLawyerName", source = "assignedLawyer.name")
    ClientResponse toResponse(Client client);
}
