/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.repository;

import com.catalogue.entity.Item;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ItemRepository extends JpaRepository<Item, UUID> {

    Page<Item> findByEnterpriseEntIdAndIsActiveTrue(String entId, Pageable pageable);

    Optional<Item> findByItemIdAndEnterpriseEntId(UUID itemId, String entId);

    boolean existsBySkuAndEnterpriseEntId(String sku, String entId);

    @Query("""
        SELECT i FROM Item i
        WHERE i.enterprise.entId = :entId
          AND i.isActive = true
          AND (:search IS NULL OR LOWER(i.name) LIKE :search OR LOWER(i.sku) LIKE :search)
          AND (:typeId IS NULL OR i.itemType.typeId = :typeId)
          AND (:subTypeId IS NULL OR i.itemSubType.subTypeId = :subTypeId)
          AND (:brandId IS NULL OR i.itemBrand.brandId = :brandId)
          AND (:sizeId IS NULL OR i.itemSize.sizeId = :sizeId)
    """)
    Page<Item> searchItems(
        @Param("entId") String entId,
        @Param("search") String search,
        @Param("typeId") Integer typeId,
        @Param("subTypeId") Integer subTypeId,
        @Param("brandId") Integer brandId,
        @Param("sizeId") Integer sizeId,
        Pageable pageable
    );

    List<Item> findByEnterpriseEntIdAndItemIdIn(String entId, List<UUID> itemIds);

    long countByEnterpriseEntIdAndIsActiveTrue(String entId);
}
