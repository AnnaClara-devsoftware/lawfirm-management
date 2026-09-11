package com.lawfirm.management.document;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import com.lawfirm.management.document.dto.DocumentResponse; import com.lawfirm.management.user.User; import lombok.RequiredArgsConstructor; import org.springframework.core.io.Resource; import org.springframework.data.domain.*; import org.springframework.http.*; import org.springframework.security.core.annotation.AuthenticationPrincipal; import org.springframework.web.bind.annotation.*; import org.springframework.web.multipart.MultipartFile; import java.util.UUID;
@SecurityRequirement(name="bearerAuth")
@Tag(name="Documentos", description="Upload, consulta, download e exclusão de documentos.")
@RestController @RequestMapping("/api/documents") @RequiredArgsConstructor
public class DocumentController {
 private final DocumentService service;
 @Operation(summary="Listar documentos")
    @GetMapping public Page<DocumentResponse> list(Pageable pageable,@RequestParam(required=false)UUID legalCaseId,@RequestParam(required=false)UUID clientId,@AuthenticationPrincipal User user){return service.list(pageable,legalCaseId,clientId,user);}
 @Operation(summary="Enviar documento")
    @PostMapping(consumes=MediaType.MULTIPART_FORM_DATA_VALUE) public ResponseEntity<DocumentResponse> upload(@RequestPart MultipartFile file,@RequestParam(required=false)UUID legalCaseId,@RequestParam(required=false)UUID clientId,@RequestParam(required=false)String description,@AuthenticationPrincipal User user){return ResponseEntity.status(HttpStatus.CREATED).body(service.upload(file,legalCaseId,clientId,description,user));}
 @Operation(summary="Baixar documento")
    @GetMapping("/{id}/download") public ResponseEntity<Resource> download(@PathVariable UUID id,@AuthenticationPrincipal User user){var d=service.getAccessible(id,user);return ResponseEntity.ok().contentType(MediaType.parseMediaType(d.getContentType())).header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=\""+d.getOriginalFilename().replaceAll("[\\/\r\n\"]", "_").replaceAll("[^\\p{L}\\p{N}._ -]", "_")+"\"").body(service.download(id,user));}
 @Operation(summary="Excluir documento")
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) public void delete(@PathVariable UUID id,@AuthenticationPrincipal User user){service.delete(id,user);}
}
