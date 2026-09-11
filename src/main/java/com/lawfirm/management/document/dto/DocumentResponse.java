package com.lawfirm.management.document.dto;
import java.time.LocalDateTime; import java.util.UUID;
public record DocumentResponse(UUID id, String originalFilename, String contentType, long fileSize, String sha256, String description, UUID legalCaseId, UUID clientId, UUID uploadedBy, LocalDateTime createdAt, LocalDateTime updatedAt) {}
