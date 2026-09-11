package com.lawfirm.management.appointment;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.appointment.dto.*; import com.lawfirm.management.user.User; import jakarta.validation.Valid; import lombok.RequiredArgsConstructor; import org.springframework.data.domain.*; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import java.util.UUID;
@SecurityRequirement(name="bearerAuth")
@Tag(name="Agenda", description="Gestão de compromissos e audiências.")
@RestController @RequestMapping("/api/appointments") @RequiredArgsConstructor public class AppointmentController {private final AppointmentService service;
 @Operation(summary="Listar compromissos")
    @GetMapping public Page<AppointmentResponse> list(@RequestParam(required=false) AppointmentStatus status,Pageable pageable,@AuthenticationPrincipal User user){return service.list(status,pageable,user);}
 @Operation(summary="Consultar compromisso")
    @GetMapping("/{id}") public AppointmentResponse find(@PathVariable UUID id,@AuthenticationPrincipal User user){return service.findById(id,user);}
 @Operation(summary="Cadastrar compromisso")
    @PostMapping public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody CreateAppointmentRequest r,@AuthenticationPrincipal User user){return ResponseEntity.status(HttpStatus.CREATED).body(service.create(r,user));}
 @Operation(summary="Atualizar compromisso")
    @PutMapping("/{id}") public AppointmentResponse update(@PathVariable UUID id,@Valid @RequestBody UpdateAppointmentRequest r,@AuthenticationPrincipal User user){return service.update(id,r,user);}
 @Operation(summary="Concluir compromisso")
    @PatchMapping("/{id}/complete") public AppointmentResponse complete(@PathVariable UUID id,@AuthenticationPrincipal User user){return service.complete(id,user);}
 @Operation(summary="Cancelar compromisso")
    @PatchMapping("/{id}/cancel") public AppointmentResponse cancel(@PathVariable UUID id,@AuthenticationPrincipal User user){return service.cancel(id,user);}
}
