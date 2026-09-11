package com.lawfirm.management.user.dto;
import jakarta.validation.constraints.*;
public record UpdateProfileRequest(@NotBlank @Size(max=150) String name, @Size(max=30) String phone) {}
