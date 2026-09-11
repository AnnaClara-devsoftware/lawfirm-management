package com.lawfirm.management.document;
import org.springframework.data.domain.*; import org.springframework.data.jpa.repository.JpaRepository; import java.util.UUID;
public interface DocumentRepository extends JpaRepository<Document,UUID> {
 Page<Document> findAllByLegalCaseId(UUID id, Pageable pageable);
 Page<Document> findAllByClientId(UUID id, Pageable pageable);
 Page<Document> findAllByClientIdAndLegalCaseAssignedLawyerId(UUID clientId, UUID lawyerId, Pageable pageable);
 Page<Document> findAllByUploadedById(UUID id, Pageable pageable);
 boolean existsBySha256AndLegalCaseId(String sha256, UUID caseId);
}
