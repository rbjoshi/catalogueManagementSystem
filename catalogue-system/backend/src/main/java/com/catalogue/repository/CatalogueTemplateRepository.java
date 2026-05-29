/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.repository;

import com.catalogue.entity.CatalogueTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CatalogueTemplateRepository extends JpaRepository<CatalogueTemplate, Integer> {
    List<CatalogueTemplate> findByIsActiveTrueOrderByName();
}
