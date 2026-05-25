package com.catalogue.controller;

import com.catalogue.dto.request.LookupRequest;
import com.catalogue.dto.response.ApiResponse;
import com.catalogue.service.LookupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/lookups")
@RequiredArgsConstructor
@Tag(name = "Lookups")
public class LookupController extends BaseController {

    private final LookupService lookupService;

    @GetMapping
    @Operation(summary = "Get all lookups (types, subtypes, sizes, brands) in one call")
    public ApiResponse<Map<String, Object>> getAllLookups() {
        return ApiResponse.ok(lookupService.getAllLookups(currentEntId()));
    }

    // ── Item Types ────────────────────────────────────────────────────────────

    @GetMapping("/types")
    public ApiResponse<List<Map<String, Object>>> getTypes() {
        return ApiResponse.ok(lookupService.getTypes(currentEntId()));
    }

    @PostMapping("/types")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createType(@Valid @RequestBody LookupRequest req) {
        return ApiResponse.ok("Type created", lookupService.createType(currentEntId(), req));
    }

    @DeleteMapping("/types/{typeId}")
    public ApiResponse<Void> deleteType(@PathVariable Integer typeId) {
        lookupService.deleteType(currentEntId(), typeId);
        return ApiResponse.ok("Type deleted", null);
    }

    // ── Sub Types ─────────────────────────────────────────────────────────────

    @GetMapping("/sub-types")
    public ApiResponse<List<Map<String, Object>>> getSubTypes(
            @RequestParam(required = false) Integer typeId) {
        return ApiResponse.ok(lookupService.getSubTypes(currentEntId(), typeId));
    }

    @PostMapping("/types/{typeId}/sub-types")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createSubType(
            @PathVariable Integer typeId,
            @Valid @RequestBody LookupRequest req) {
        return ApiResponse.ok("Sub-type created",
                lookupService.createSubType(currentEntId(), typeId, req));
    }

    // ── Sizes ─────────────────────────────────────────────────────────────────

    @GetMapping("/sizes")
    public ApiResponse<List<Map<String, Object>>> getSizes() {
        return ApiResponse.ok(lookupService.getSizes(currentEntId()));
    }

    @PostMapping("/sizes")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createSize(@Valid @RequestBody LookupRequest req) {
        return ApiResponse.ok("Size created", lookupService.createSize(currentEntId(), req));
    }

    // ── Brands ────────────────────────────────────────────────────────────────

    @GetMapping("/brands")
    public ApiResponse<List<Map<String, Object>>> getBrands() {
        return ApiResponse.ok(lookupService.getBrands(currentEntId()));
    }

    @PostMapping("/brands")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<Map<String, Object>> createBrand(@Valid @RequestBody LookupRequest req) {
        return ApiResponse.ok("Brand created", lookupService.createBrand(currentEntId(), req));
    }
}
