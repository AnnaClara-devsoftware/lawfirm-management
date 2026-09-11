package com.lawfirm.management.dashboard;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.dashboard.dto.DashboardResponse; import com.lawfirm.management.user.User; import lombok.RequiredArgsConstructor; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*;
@SecurityRequirement(name="bearerAuth")
@Tag(name="Dashboard", description="Indicadores operacionais do escritório.")
@RestController @RequestMapping("/api/dashboard") @RequiredArgsConstructor public class DashboardController { private final DashboardService service; @Operation(summary="Consultar indicadores do dashboard")
    @GetMapping public DashboardResponse summary(@AuthenticationPrincipal User user){return service.summary(user);} }
