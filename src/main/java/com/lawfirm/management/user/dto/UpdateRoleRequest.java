package com.lawfirm.management.user.dto;
import com.lawfirm.management.user.Role;
import jakarta.validation.constraints.NotNull;
public record UpdateRoleRequest(@NotNull Role role) {}
