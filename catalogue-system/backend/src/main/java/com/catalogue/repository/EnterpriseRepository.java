/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.repository;

import com.catalogue.entity.Enterprise;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EnterpriseRepository extends JpaRepository<Enterprise, String> {
    Optional<Enterprise> findByDomain(String domain);
    boolean existsByDomain(String domain);
}
