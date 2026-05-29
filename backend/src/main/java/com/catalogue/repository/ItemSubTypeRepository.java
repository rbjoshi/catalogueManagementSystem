/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.repository;

import com.catalogue.entity.ItemSubType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemSubTypeRepository extends JpaRepository<ItemSubType, Integer> {
    List<ItemSubType> findByItemTypeTypeIdAndEnterpriseEntIdAndIsActiveTrueOrderByName(Integer typeId, String entId);
    List<ItemSubType> findByEnterpriseEntIdAndIsActiveTrueOrderByName(String entId);
    Optional<ItemSubType> findBySubTypeIdAndEnterpriseEntId(Integer subTypeId, String entId);
}
