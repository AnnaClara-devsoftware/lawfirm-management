package com.lawfirm.management.client.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

public record CreateClientRequest(
        @NotBlank @Size(max = 150) String name,
        @Pattern(regexp = "^$|\\d{11}|\\d{14}", message = "Documento deve conter 11 ou 14 dígitos.") String document,
        @Email @Size(max = 180) String email,
        @Size(max = 30) String phone,
        @Size(max = 120) String street,
        @Size(max = 20) String number,
        @Size(max = 100) String complement,
        @Size(max = 100) String neighborhood,
        @Size(max = 100) String city,
        @Pattern(regexp = "^$|[A-Za-z]{2}", message = "UF deve conter 2 letras.") String state,
        @Pattern(regexp = "^$|\\d{8}", message = "CEP deve conter 8 dígitos.") String zipCode,
        UUID assignedLawyerId
) {}
