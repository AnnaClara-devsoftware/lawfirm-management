package com.lawfirm.management.legalcase;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.UUID;

public interface LegalCaseRepository extends JpaRepository<LegalCase, UUID> {
    boolean existsByCnjNumber(String cnjNumber);
    boolean existsByCnjNumberAndIdNot(String cnjNumber, UUID id);
    Page<LegalCase> findAllByAssignedLawyerId(UUID lawyerId, Pageable pageable);
    Page<LegalCase> findAllByClientId(UUID clientId, Pageable pageable);
    long countByAssignedLawyerId(UUID lawyerId);
    long countByStatus(LegalCaseStatus status);
    long countByAssignedLawyerIdAndStatus(UUID lawyerId, LegalCaseStatus status);

    /** Busca por título (contém) ou número CNJ (contém), com filtro opcional de status. */
    @Query("select lc from LegalCase lc where "
            + "(:search is null or lower(lc.title) like lower(concat('%', :search, '%')) "
            + "or lc.cnjNumber like concat('%', :search, '%')) "
            + "and (:status is null or lc.status = :status)")
    Page<LegalCase> search(@Param("search") String search, @Param("status") LegalCaseStatus status, Pageable pageable);

    /** Mesma busca acima, restrita aos processos do advogado informado. */
    @Query("select lc from LegalCase lc where lc.assignedLawyer.id = :lawyerId "
            + "and (:search is null or lower(lc.title) like lower(concat('%', :search, '%')) "
            + "or lc.cnjNumber like concat('%', :search, '%')) "
            + "and (:status is null or lc.status = :status)")
    Page<LegalCase> searchByAssignedLawyerId(@Param("lawyerId") UUID lawyerId, @Param("search") String search,
                                              @Param("status") LegalCaseStatus status, Pageable pageable);
}

