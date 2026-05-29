/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.repository;

import com.catalogue.entity.ItemType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemTypeRepository extends JpaRepository<ItemType, Integer> {
    List<ItemType> findByEnterpriseEntIdAndIsActiveTrueOrderByName(String entId);
    Optional<ItemType> findByTypeIdAndEnterpriseEntId(Integer typeId, String entId);
    boolean existsByNameAndEnterpriseEntId(String name, String entId);
}
