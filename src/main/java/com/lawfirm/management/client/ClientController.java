package com.lawfirm.management.client;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;

import com.lawfirm.management.client.dto.*;
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
 * ASSISTENTE tem acesso de leitura a clientes (listar/consultar). Cadastro,
 * edição, ativação e desativação exigem ADMIN ou ADVOGADO.
 */
@SecurityRequirement(name="bearerAuth")
@Tag(name="Clientes", description="Cadastro e gestão de clientes do escritório.")
@RestController @RequestMapping("/api/clients") @RequiredArgsConstructor
public class ClientController {
    private final ClientService service;

    @Operation(summary="Listar clientes", description="Filtros opcionais: search (nome ou documento) e active (true/false).")
    @GetMapping
    public Page<ClientResponse> list(@RequestParam(required = false) String search,
                                      @RequestParam(required = false) Boolean active,
                                      Pageable pageable, @AuthenticationPrincipal User user) {
        return service.list(pageable, user, search, active);
    }
    @Operation(summary="Consultar cliente")
    @GetMapping("/{id}")
    public ClientResponse findById(@PathVariable UUID id, @AuthenticationPrincipal User user) { return service.findById(id, user); }
    @Operation(summary="Cadastrar cliente")
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public ResponseEntity<ClientResponse> create(@Valid @RequestBody CreateClientRequest req, @AuthenticationPrincipal User user) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req, user));
    }
    @Operation(summary="Atualizar cliente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    public ClientResponse update(@PathVariable UUID id, @Valid @RequestBody UpdateClientRequest req, @AuthenticationPrincipal User user) { return service.update(id, req, user); }
    @Operation(summary="Desativar cliente")
    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deactivate(@PathVariable UUID id, @AuthenticationPrincipal User user) { service.deactivate(id, user); }
    @Operation(summary="Ativar cliente")
    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('ADMIN','ADVOGADO')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void activate(@PathVariable UUID id, @AuthenticationPrincipal User user) { service.activate(id, user); }
}
