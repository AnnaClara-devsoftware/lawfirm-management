package com.lawfirm.management.document;
import com.lawfirm.management.document.dto.DocumentResponse; import org.mapstruct.Mapper; import org.mapstruct.Mapping;
@Mapper(componentModel="spring") public interface DocumentMapper {
 @Mapping(target="legalCaseId", source="legalCase.id") @Mapping(target="clientId", source="client.id") @Mapping(target="uploadedBy", source="uploadedBy.id")
 DocumentResponse toResponse(Document entity);
}
