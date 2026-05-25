package com.catalogue.repository;

import com.catalogue.entity.CatalogueItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CatalogueItemRepository extends JpaRepository<CatalogueItem, UUID> {
    List<CatalogueItem> findByCatalogueCatIdOrderByPageNumberAscPositionAsc(UUID catId);
    void deleteByCatalogueCatId(UUID catId);
}
