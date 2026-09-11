package com.lawfirm.management.client;

import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.*;

public interface ClientRepository extends JpaRepository<Client, UUID> {
    boolean existsByDocument(String document);
    boolean existsByDocumentAndIdNot(String document, UUID id);
    @Query("select c from Client c where c.assignedLawyer.id = :lawyerId")
    Page<Client> findAllByAssignedLawyerId(UUID lawyerId, Pageable pageable);
    long countByAssignedLawyerId(UUID lawyerId);
    long countByAssignedLawyerIdAndActiveTrue(UUID lawyerId);
    long countByActiveTrue();

    /**
     * Busca por nome (contém, case-insensitive) ou documento (contém),
     * com filtro opcional de status ativo/inativo. Todos os usuários com
     * visão irrestrita (ADMIN/ASSISTENTE) passam por aqui.
     */
    @Query("select c from Client c where "
            + "(:search is null or lower(c.name) like lower(concat('%', :search, '%')) "
            + "or c.document like concat('%', :search, '%')) "
            + "and (:active is null or c.active = :active)")
    Page<Client> search(@Param("search") String search, @Param("active") Boolean active, Pageable pageable);

    /** Mesma busca acima, mas restrita aos clientes do advogado informado. */
    @Query("select c from Client c where c.assignedLawyer.id = :lawyerId "
            + "and (:search is null or lower(c.name) like lower(concat('%', :search, '%')) "
            + "or c.document like concat('%', :search, '%')) "
            + "and (:active is null or c.active = :active)")
    Page<Client> searchByAssignedLawyerId(@Param("lawyerId") UUID lawyerId, @Param("search") String search,
                                           @Param("active") Boolean active, Pageable pageable);
}

