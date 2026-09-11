package com.lawfirm.management.client.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record ClientResponse(
        UUID id, String name, String document, String email, String phone,
        String street, String number, String complement, String neighborhood,
        String city, String state, String zipCode, boolean active,
        UUID assignedLawyerId, String assignedLawyerName,
        LocalDateTime createdAt, LocalDateTime updatedAt) {}
