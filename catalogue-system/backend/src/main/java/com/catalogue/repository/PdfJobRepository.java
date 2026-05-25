package com.catalogue.repository;

import com.catalogue.entity.PdfJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PdfJobRepository extends JpaRepository<PdfJob, UUID> {
    Optional<PdfJob> findByJobIdAndEnterpriseEntId(UUID jobId, String entId);
}
