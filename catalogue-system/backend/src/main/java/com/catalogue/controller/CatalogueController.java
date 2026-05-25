package com.catalogue.controller;

import com.catalogue.dto.request.CatalogueRequest;
import com.catalogue.dto.response.*;
import com.catalogue.entity.Catalogue;
import com.catalogue.repository.CatalogueTemplateRepository;
import com.catalogue.service.CatalogueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/catalogues")
@RequiredArgsConstructor
@Tag(name = "Catalogues")
public class CatalogueController extends BaseController {

    private final CatalogueService catalogueService;
    private final CatalogueTemplateRepository templateRepository;

    @GetMapping
    @Operation(summary = "List catalogues for current enterprise")
    public ApiResponse<Page<CatalogueResponse>> getCatalogues(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Catalogue.Status statusEnum = null;
        if (status != null) statusEnum = Catalogue.Status.valueOf(status.toUpperCase());

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return ApiResponse.ok(catalogueService.getCatalogues(currentEntId(), statusEnum, search, pageable));
    }

    @GetMapping("/{catId}")
    @Operation(summary = "Get a single catalogue")
    public ApiResponse<CatalogueResponse> getCatalogue(@PathVariable UUID catId) {
        return ApiResponse.ok(catalogueService.getCatalogue(currentEntId(), catId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new catalogue")
    public ApiResponse<CatalogueResponse> createCatalogue(@Valid @RequestBody CatalogueRequest req) {
        return ApiResponse.ok("Catalogue created",
                catalogueService.createCatalogue(currentEntId(), currentUserId(), req));
    }

    @PutMapping("/{catId}")
    @Operation(summary = "Update catalogue layout and items")
    public ApiResponse<CatalogueResponse> updateCatalogue(
            @PathVariable UUID catId,
            @Valid @RequestBody CatalogueRequest req) {
        return ApiResponse.ok("Catalogue updated",
                catalogueService.updateCatalogue(currentEntId(), catId, req));
    }

    @PostMapping("/{catId}/publish")
    @Operation(summary = "Publish a catalogue")
    public ApiResponse<CatalogueResponse> publishCatalogue(@PathVariable UUID catId) {
        return ApiResponse.ok("Catalogue published",
                catalogueService.publishCatalogue(currentEntId(), catId));
    }

    @DeleteMapping("/{catId}")
    @Operation(summary = "Archive a catalogue")
    public ApiResponse<Void> deleteCatalogue(@PathVariable UUID catId) {
        catalogueService.deleteCatalogue(currentEntId(), catId);
        return ApiResponse.ok("Catalogue archived", null);
    }

    @PostMapping("/{catId}/export-pdf")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Request async PDF export")
    public ApiResponse<PdfJobResponse> exportPdf(@PathVariable UUID catId) {
        return ApiResponse.ok("PDF export started",
                catalogueService.requestPdfExport(currentEntId(), catId, currentUserId()));
    }

    @GetMapping("/pdf-jobs/{jobId}")
    @Operation(summary = "Check PDF job status")
    public ApiResponse<PdfJobResponse> getPdfStatus(@PathVariable UUID jobId) {
        return ApiResponse.ok(catalogueService.getPdfJobStatus(currentEntId(), jobId));
    }

    @GetMapping("/templates")
    @Operation(summary = "Get all available catalogue templates")
    public ApiResponse<List<Object>> getTemplates() {
        var templates = templateRepository.findByIsActiveTrueOrderByName()
                .stream()
                .map(t -> (Object) java.util.Map.of(
                        "templateId", t.getTemplateId(),
                        "name", t.getName(),
                        "description", t.getDescription() != null ? t.getDescription() : "",
                        "pageSize", t.getPageSize(),
                        "layoutConfig", t.getLayoutConfig()))
                .collect(Collectors.toList());
        return ApiResponse.ok(templates);
    }
}
