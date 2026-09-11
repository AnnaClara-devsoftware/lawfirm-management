package com.lawfirm.management.document;

import com.lawfirm.management.client.ClientRepository;
import com.lawfirm.management.common.audit.*;
import com.lawfirm.management.common.audit.Auditable;
import com.lawfirm.management.common.exception.*;
import com.lawfirm.management.legalcase.LegalCase;
import com.lawfirm.management.legalcase.LegalCaseRepository;
import com.lawfirm.management.legalcase.LegalCaseStatus;
import com.lawfirm.management.user.*;
import com.lawfirm.management.document.dto.DocumentResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.data.domain.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.io.*; import java.nio.file.*; import java.security.*; import java.util.*;

@Service @RequiredArgsConstructor
public class DocumentService {
 private final DocumentRepository repository; private final LegalCaseRepository caseRepository; private final ClientRepository clientRepository; private final UserRepository userRepository; private final DocumentMapper mapper; private final AuditLogService auditLogService;
 @Value("${app.storage.documents-dir:./storage/documents}") private String storageDir;

 @Transactional
 @Auditable(action=AuditAction.CREATE, entityName="Document", description="Documento anexado ao sistema.")
 public DocumentResponse upload(MultipartFile file, UUID caseId, UUID clientId, String description, User currentUser) {
  if(file==null || file.isEmpty()) throw new BusinessException("O arquivo não pode estar vazio.");
  if(file.getSize()>10*1024*1024) throw new BusinessException("O arquivo excede o limite de 10 MB.");
  if(caseId==null && clientId==null) throw new BusinessException("Informe um processo ou cliente para vincular o documento.");
  LegalCase legalCase=caseId==null?null:caseRepository.findById(caseId).orElseThrow(()->ResourceNotFoundException.of("Processo",caseId));
  if(legalCase!=null) ensureCaseAccess(legalCase,currentUser);
  var client=clientId==null?null:clientRepository.findById(clientId).orElseThrow(()->ResourceNotFoundException.of("Cliente",clientId));
  if(client!=null && currentUser.getRole()==Role.ADVOGADO && (client.getAssignedLawyer()==null || !currentUser.getId().equals(client.getAssignedLawyer().getId()))) throw new ForbiddenOperationException("Você não possui acesso a este cliente.");
  if(legalCase!=null && legalCase.getStatus()==LegalCaseStatus.CLOSED) throw new BusinessException("Não é possível anexar documentos a um processo encerrado.");
  if(client!=null && !client.isActive()) throw new BusinessException("Não é possível anexar documento a um cliente inativo.");
  try {
   String hash=sha256(file.getInputStream()); String ext=extension(file.getOriginalFilename()); String key=UUID.randomUUID()+ext; Path dir=Paths.get(storageDir).toAbsolutePath().normalize(); Files.createDirectories(dir); Files.copy(file.getInputStream(),dir.resolve(key),StandardCopyOption.REPLACE_EXISTING);
   Document doc=Document.builder().originalFilename(Optional.ofNullable(file.getOriginalFilename()).orElse("arquivo")).storageKey(key).contentType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream")).fileSize(file.getSize()).sha256(hash).description(description==null||description.isBlank()?null:description.trim()).legalCase(legalCase).client(client).uploadedBy(currentUser).build();
   return mapper.toResponse(repository.save(doc));
  } catch(IOException e){ throw new BusinessException("Não foi possível armazenar o documento."); }
 }
 @Transactional(readOnly=true) public Page<DocumentResponse> list(Pageable pageable, UUID caseId, UUID clientId, User user){
  Page<Document> p;
  if(caseId!=null){ LegalCase c=caseRepository.findById(caseId).orElseThrow(()->ResourceNotFoundException.of("Processo",caseId)); ensureCaseAccess(c,user); p=repository.findAllByLegalCaseId(caseId,pageable); }
  else if(clientId!=null){ var c=clientRepository.findById(clientId).orElseThrow(()->ResourceNotFoundException.of("Cliente",clientId)); if(user.getRole()==Role.ADVOGADO){ if(c.getAssignedLawyer()==null || !user.getId().equals(c.getAssignedLawyer().getId())) throw new ForbiddenOperationException("Você não possui acesso a este cliente."); p=repository.findAllByClientIdAndLegalCaseAssignedLawyerId(clientId,user.getId(),pageable); } else p=repository.findAllByClientId(clientId,pageable); }
  else p=user.getRole()==Role.ADVOGADO?repository.findAllByUploadedById(user.getId(),pageable):repository.findAll(pageable);
  return p.map(mapper::toResponse);
 }
 @Transactional(readOnly=true) public Resource download(UUID id, User user){ Document d=getAccessible(id,user); try {Path path=Paths.get(storageDir).toAbsolutePath().normalize().resolve(d.getStorageKey()).normalize(); if(!path.startsWith(Paths.get(storageDir).toAbsolutePath().normalize())||!Files.exists(path)) throw new ResourceNotFoundException("Arquivo físico não encontrado."); return new FileSystemResource(path); } catch(Exception e){ if(e instanceof ResourceNotFoundException r) throw r; throw new BusinessException("Não foi possível acessar o documento."); } }
 @Transactional(readOnly=true) public Document getAccessible(UUID id, User user){ Document d=repository.findById(id).orElseThrow(()->ResourceNotFoundException.of("Documento",id)); if(user.getRole()==Role.ADVOGADO && (d.getUploadedBy()==null || !user.getId().equals(d.getUploadedBy().getId())) && (d.getLegalCase()==null || d.getLegalCase().getAssignedLawyer()==null || !user.getId().equals(d.getLegalCase().getAssignedLawyer().getId()))) throw new ForbiddenOperationException("Você não possui acesso a este documento."); return d; }
 @Transactional public void delete(UUID id, User user){ Document d=getAccessible(id,user); if(user.getRole()!=Role.ADMIN && !user.getId().equals(d.getUploadedBy().getId())) throw new ForbiddenOperationException("Somente o administrador ou o autor pode excluir o documento."); try{Files.deleteIfExists(Paths.get(storageDir).toAbsolutePath().normalize().resolve(d.getStorageKey()));}catch(IOException ignored){} repository.delete(d); auditLogService.record(AuditAction.DELETE,"Document",id.toString(),"Documento excluído."); }
 private void ensureCaseAccess(LegalCase c,User u){ if(u.getRole()==Role.ADVOGADO && (c.getAssignedLawyer()==null||!u.getId().equals(c.getAssignedLawyer().getId()))) throw new ForbiddenOperationException("Você não possui acesso a este processo."); }
 private String sha256(InputStream in)throws IOException{try{MessageDigest md=MessageDigest.getInstance("SHA-256");byte[] b=new byte[8192];int n;while((n=in.read(b))>0)md.update(b,0,n);return HexFormat.of().formatHex(md.digest());}catch(NoSuchAlgorithmException e){throw new IllegalStateException(e);}}
 private String safeDownloadFilename(String name){ if(name==null || name.isBlank()) return "arquivo"; return name.replaceAll("[\\/\r\n\"]", "_").replaceAll("[^\\p{L}\\p{N}._ -]", "_");}
 private String extension(String name){if(name==null)return "";int i=name.lastIndexOf('.');return i>0&&i<name.length()-1?name.substring(i).replaceAll("[^A-Za-z0-9.]",""):"";}
}
