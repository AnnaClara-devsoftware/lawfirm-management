package com.lawfirm.management.deadline;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.lawfirm.management.deadline.dto.*;
import com.lawfirm.management.user.User;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Gestão de prazos é responsabilidade de ADVOGADO/ADMIN. ASSISTENTE consulta
 * e lista, mas não cria, altera, conclui nem cancela prazos.
 */
@SecurityRequirement(name="bearerAuth")
@Tag(name="Prazos", description="Gestão de prazos processuais.")
@RestController @RequestMapping("/api/deadlines") @RequiredArgsConstructor
public class DeadlineController {
    private final DeadlineService service;

    @Operation(summary="Listar prazos")
    @GetMapping
    public Page<DeadlineResponse> list(
            @RequestParam(required = false) UUID legalCaseId,
            @RequestParam(required = false) DeadlineStatus status,
            @RequestParam(defaultValue = "false") boolean overdue,
            Pageable pageable, @AuthenticationPrincipal User user) {
        return service.list(legalCaseId, status, overdue, pageable, user);
    }

    @Operation(summary="Consultar prazo")
    @GetMapping("/{id}")
    public DeadlineResponse findById(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return service.findById(id, user);
    }

    @Operation(summary="Cadastrar prazo")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public ResponseEntity<DeadlineResponse> create(@Valid @RequestBody CreateDeadlineRequest req,
                                                    @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, user));
    }

    @Operation(summary="Atualizar prazo")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public DeadlineResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateDeadlineRequest req,
                                   @AuthenticationPrincipal User user) {
        return service.update(id, req, user);
    }

    @Operation(summary="Concluir prazo")
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public DeadlineResponse complete(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return service.complete(id, user);
    }

    @Operation(summary="Cancelar prazo")
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public DeadlineResponse cancel(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return service.cancel(id, user);
    }
}
