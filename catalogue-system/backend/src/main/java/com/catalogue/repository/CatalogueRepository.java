package com.catalogue.repository;

import com.catalogue.entity.Catalogue;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CatalogueRepository extends JpaRepository<Catalogue, UUID> {

    Page<Catalogue> findByEnterpriseEntIdOrderByCreatedAtDesc(String entId, Pageable pageable);

    Optional<Catalogue> findByCatIdAndEnterpriseEntId(UUID catId, String entId);

    @Query("""
        SELECT c FROM Catalogue c
        WHERE c.enterprise.entId = :entId
          AND (:status IS NULL OR c.status = :status)
          AND (:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY c.createdAt DESC
    """)
    Page<Catalogue> searchCatalogues(
        @Param("entId") String entId,
        @Param("status") Catalogue.Status status,
        @Param("search") String search,
        Pageable pageable
    );
}
