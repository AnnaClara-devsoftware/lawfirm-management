package com.lawfirm.management.legalcase;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.lawfirm.management.legalcase.dto.*;
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
 * ASSISTENTE tem acesso somente de leitura a processos (consultar/listar).
 * Criação e edição são restritas a ADMIN e ADVOGADO, conforme a matriz de
 * permissões definida na especificação do sistema.
 */
@SecurityRequirement(name="bearerAuth")
@Tag(name="Processos jurídicos", description="Gestão dos processos jurídicos.")
@RestController @RequestMapping("/api/legal-cases") @RequiredArgsConstructor
public class LegalCaseController {
    private final LegalCaseService service;

    @Operation(summary="Listar processos", description="Filtros opcionais: search (título ou nº CNJ) e status.")
    @GetMapping
    public Page<LegalCaseResponse> list(@RequestParam(required = false) String search,
                                         @RequestParam(required = false) LegalCaseStatus status,
                                         Pageable pageable, @AuthenticationPrincipal User user) {
        return service.list(pageable, user, search, status);
    }
    @Operation(summary="Consultar processo")
    @GetMapping("/{id}")
    public LegalCaseResponse findById(@PathVariable UUID id, @AuthenticationPrincipal User user) { return service.findById(id, user); }
    @Operation(summary="Cadastrar processo")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public ResponseEntity<LegalCaseResponse> create(@Valid @RequestBody CreateLegalCaseRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, user));
    }
    @Operation(summary="Atualizar processo")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public LegalCaseResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateLegalCaseRequest req, @AuthenticationPrincipal User user) {
        return service.update(id, req, user);
    }
}
