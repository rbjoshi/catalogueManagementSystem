/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.service;

import com.catalogue.dto.request.CatalogueRequest;
import com.catalogue.dto.response.CatalogueResponse;
import com.catalogue.dto.response.CatalogueItemResponse;
import com.catalogue.dto.response.PdfJobResponse;
import com.catalogue.entity.*;
import com.catalogue.exception.BadRequestException;
import com.catalogue.exception.ResourceNotFoundException;
import com.catalogue.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class CatalogueService {

    private final CatalogueRepository catalogueRepository;
    private final CatalogueTemplateRepository templateRepository;
    private final CatalogueItemRepository catalogueItemRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final PdfJobRepository pdfJobRepository;
    private final PdfService pdfService;
    private final ItemService itemService;

    @Transactional
    @CacheEvict(value = "catalogues", key = "#entId")
    public CatalogueResponse createCatalogue(String entId, UUID userId, CatalogueRequest req) {
        Enterprise enterprise = getEnterprise(entId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Catalogue.CatalogueBuilder builder = Catalogue.builder()
                .enterprise(enterprise)
                .user(user)
                .name(req.getName())
                .description(req.getDescription())
                .layoutJson(req.getLayoutJson() != null ? req.getLayoutJson() : java.util.Map.of())
                .pageSize(req.getPageSize() != null ? req.getPageSize() : "A4")
                .orientation(req.getOrientation() != null ? req.getOrientation() : "PORTRAIT")
                .coverImage(req.getCoverImage())
                .status(Catalogue.Status.DRAFT);

        if (req.getTemplateId() != null) {
            templateRepository.findById(req.getTemplateId()).ifPresent(builder::template);
        }

        Catalogue catalogue = catalogueRepository.save(builder.build());

        // Add items if provided
        if (req.getItems() != null && !req.getItems().isEmpty()) {
            addItemsToCatalogue(catalogue, entId, req.getItems());
            catalogue.setItemCount(req.getItems().size());
            catalogueRepository.save(catalogue);
        }

        log.info("Catalogue created: catId={}, entId={}", catalogue.getCatId(), entId);
        return toResponse(catalogue);
    }

    @Transactional
    @CacheEvict(value = "catalogues", key = "#entId")
    public CatalogueResponse updateCatalogue(String entId, UUID catId, CatalogueRequest req) {
        Catalogue catalogue = catalogueRepository.findByCatIdAndEnterpriseEntId(catId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogue not found"));

        if (req.getName() != null) catalogue.setName(req.getName());
        if (req.getDescription() != null) catalogue.setDescription(req.getDescription());
        if (req.getLayoutJson() != null) catalogue.setLayoutJson(req.getLayoutJson());
        if (req.getPageSize() != null) catalogue.setPageSize(req.getPageSize());
        if (req.getOrientation() != null) catalogue.setOrientation(req.getOrientation());
        if (req.getCoverImage() != null) catalogue.setCoverImage(req.getCoverImage());
        if (req.getTemplateId() != null) {
            templateRepository.findById(req.getTemplateId()).ifPresent(catalogue::setTemplate);
        }

        // Replace items
        if (req.getItems() != null) {
            catalogue.getCatalogueItems().clear();
            addItemsToCatalogue(catalogue, entId, req.getItems());
            catalogue.setItemCount(req.getItems().size());
        }

        catalogue.setVersion(catalogue.getVersion() + 1);
        return toResponse(catalogueRepository.save(catalogue));
    }

    public Page<CatalogueResponse> getCatalogues(String entId, Catalogue.Status status,
                                                  String search, Pageable pageable) {
        String searchTerm = (search != null && !search.isBlank()) ? "%" + search.toLowerCase() + "%" : null;
        return catalogueRepository.searchCatalogues(entId, status, searchTerm, pageable)
                .map(this::toResponse);
    }

    public CatalogueResponse getCatalogue(String entId, UUID catId) {
        return toResponse(catalogueRepository.findByCatIdAndEnterpriseEntId(catId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogue not found")));
    }

    @Transactional
    @CacheEvict(value = "catalogues", key = "#entId")
    public CatalogueResponse publishCatalogue(String entId, UUID catId) {
        Catalogue catalogue = catalogueRepository.findByCatIdAndEnterpriseEntId(catId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogue not found"));
        catalogue.setStatus(Catalogue.Status.PUBLISHED);
        catalogue.setPublishedAt(ZonedDateTime.now());
        return toResponse(catalogueRepository.save(catalogue));
    }

    @Transactional
    @CacheEvict(value = "catalogues", key = "#entId")
    public void deleteCatalogue(String entId, UUID catId) {
        Catalogue catalogue = catalogueRepository.findByCatIdAndEnterpriseEntId(catId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogue not found"));
        catalogue.setStatus(Catalogue.Status.ARCHIVED);
        catalogueRepository.save(catalogue);
    }

    public PdfJobResponse requestPdfExport(String entId, UUID catId, UUID userId) {
        Catalogue catalogue = catalogueRepository.findByCatIdAndEnterpriseEntId(catId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogue not found"));

        Enterprise enterprise = getEnterprise(entId);
        User user = userRepository.findById(userId).orElse(null);

        PdfJob job = PdfJob.builder()
                .catalogue(catalogue)
                .enterprise(enterprise)
                .requestedBy(user)
                .status(PdfJob.Status.PENDING)
                .build();

        job = pdfJobRepository.save(job);
        pdfService.generatePdfAsync(job.getJobId());
        log.info("PDF job enqueued: jobId={}, catId={}", job.getJobId(), catId);

        return toPdfJobResponse(job);
    }

    public PdfJobResponse getPdfJobStatus(String entId, UUID jobId) {
        PdfJob job = pdfJobRepository.findByJobIdAndEnterpriseEntId(jobId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("PDF job not found"));
        return toPdfJobResponse(job);
    }

    private void addItemsToCatalogue(Catalogue catalogue, String entId,
                                     List<CatalogueRequest.CatalogueItemRequest> itemRequests) {
        for (CatalogueRequest.CatalogueItemRequest ir : itemRequests) {
            UUID itemId = UUID.fromString(ir.getItemId());
            itemRepository.findByItemIdAndEnterpriseEntId(itemId, entId).ifPresent(item -> {
                CatalogueItem ci = CatalogueItem.builder()
                        .catalogue(catalogue)
                        .item(item)
                        .pageNumber(ir.getPageNumber() != null ? ir.getPageNumber() : 1)
                        .position(ir.getPosition() != null ? ir.getPosition() : 0)
                        .customName(ir.getCustomName())
                        .customPrice(ir.getCustomPrice())
                        .customDesc(ir.getCustomDesc())
                        .customOverrides(ir.getCustomOverrides() != null ? ir.getCustomOverrides() : java.util.Map.of())
                        .build();
                catalogue.getCatalogueItems().add(ci);
            });
        }
    }

    private CatalogueResponse toResponse(Catalogue c) {
        List<CatalogueItemResponse> itemResponses = c.getCatalogueItems().stream()
                .map(ci -> CatalogueItemResponse.builder()
                        .item(itemService.toResponse(ci.getItem()))
                        .pageNumber(ci.getPageNumber())
                        .position(ci.getPosition())
                        .customName(ci.getCustomName())
                        .customPrice(ci.getCustomPrice())
                        .customDesc(ci.getCustomDesc())
                        .customOverrides(ci.getCustomOverrides())
                        .build())
                .collect(Collectors.toList());

        return CatalogueResponse.builder()
                .catId(c.getCatId())
                .entId(c.getEnterprise().getEntId())
                .name(c.getName())
                .description(c.getDescription())
                .layoutJson(c.getLayoutJson())
                .pageSize(c.getPageSize())
                .orientation(c.getOrientation())
                .status(c.getStatus().name())
                .coverImage(c.getCoverImage())
                .itemCount(c.getItemCount())
                .version(c.getVersion())
                .templateId(c.getTemplate() != null ? c.getTemplate().getTemplateId() : null)
                .templateName(c.getTemplate() != null ? c.getTemplate().getName() : null)
                .publishedAt(c.getPublishedAt())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .items(itemResponses)
                .build();
    }

    private PdfJobResponse toPdfJobResponse(PdfJob job) {
        return PdfJobResponse.builder()
                .jobId(job.getJobId())
                .catId(job.getCatalogue().getCatId())
                .status(job.getStatus().name())
                .fileUrl(job.getFileUrl())
                .errorMsg(job.getErrorMsg())
                .createdAt(job.getCreatedAt())
                .completedAt(job.getCompletedAt())
                .build();
    }

    private Enterprise getEnterprise(String entId) {
        return enterpriseRepository.findById(entId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found"));
    }
}
