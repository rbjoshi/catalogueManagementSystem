/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.service;

import com.catalogue.dto.request.LookupRequest;
import com.catalogue.entity.*;
import com.catalogue.exception.BadRequestException;
import com.catalogue.exception.ResourceNotFoundException;
import com.catalogue.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LookupService {

    private final ItemTypeRepository itemTypeRepository;
    private final ItemSubTypeRepository itemSubTypeRepository;
    private final ItemSizeRepository itemSizeRepository;
    private final ItemBrandRepository itemBrandRepository;
    private final EnterpriseRepository enterpriseRepository;

    // ── Types ─────────────────────────────────────────────────────────────────

    @Cacheable(value = "lookups", key = "'types-' + #entId")
    public List<Map<String, Object>> getTypes(String entId) {
        return itemTypeRepository.findByEnterpriseEntIdAndIsActiveTrueOrderByName(entId)
                .stream().map(this::typeToMap).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'types-' + #entId")
    public Map<String, Object> createType(String entId, LookupRequest req) {
        if (itemTypeRepository.existsByNameAndEnterpriseEntId(req.getName(), entId))
            throw new BadRequestException("Type already exists: " + req.getName());
        Enterprise ent = getEnterprise(entId);
        ItemType t = ItemType.builder()
                .enterprise(ent).name(req.getName()).description(req.getDescription()).build();
        return typeToMap(itemTypeRepository.save(t));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'types-' + #entId")
    public Map<String, Object> updateType(String entId, Integer typeId, LookupRequest req) {
        ItemType t = itemTypeRepository.findByTypeIdAndEnterpriseEntId(typeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found"));
        t.setName(req.getName());
        t.setDescription(req.getDescription());
        return typeToMap(itemTypeRepository.save(t));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'types-' + #entId")
    public void deleteType(String entId, Integer typeId) {
        ItemType t = itemTypeRepository.findByTypeIdAndEnterpriseEntId(typeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found"));
        t.setActive(false);
        itemTypeRepository.save(t);
    }

    // ── Sub Types ─────────────────────────────────────────────────────────────

    @Cacheable(value = "lookups", key = "'subtypes-' + #entId + '-' + (#typeId ?: 'all')")
    public List<Map<String, Object>> getSubTypes(String entId, Integer typeId) {
        List<ItemSubType> list = typeId != null
                ? itemSubTypeRepository.findByItemTypeTypeIdAndEnterpriseEntIdAndIsActiveTrueOrderByName(typeId, entId)
                : itemSubTypeRepository.findByEnterpriseEntIdAndIsActiveTrueOrderByName(entId);
        return list.stream().map(this::subTypeToMap).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lookups", allEntries = true)
    public Map<String, Object> createSubType(String entId, Integer typeId, LookupRequest req) {
        Enterprise ent = getEnterprise(entId);
        ItemType type = itemTypeRepository.findByTypeIdAndEnterpriseEntId(typeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found"));
        ItemSubType st = ItemSubType.builder()
                .enterprise(ent).itemType(type).name(req.getName()).description(req.getDescription()).build();
        return subTypeToMap(itemSubTypeRepository.save(st));
    }

    @Transactional
    @CacheEvict(value = "lookups", allEntries = true)
    public Map<String, Object> updateSubType(String entId, Integer subTypeId, LookupRequest req) {
        ItemSubType st = itemSubTypeRepository.findBySubTypeIdAndEnterpriseEntId(subTypeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-type not found"));
        st.setName(req.getName());
        st.setDescription(req.getDescription());
        return subTypeToMap(itemSubTypeRepository.save(st));
    }

    @Transactional
    @CacheEvict(value = "lookups", allEntries = true)
    public void deleteSubType(String entId, Integer subTypeId) {
        ItemSubType st = itemSubTypeRepository.findBySubTypeIdAndEnterpriseEntId(subTypeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Sub-type not found"));
        st.setActive(false);
        itemSubTypeRepository.save(st);
    }

    // ── Sizes ─────────────────────────────────────────────────────────────────

    @Cacheable(value = "lookups", key = "'sizes-' + #entId")
    public List<Map<String, Object>> getSizes(String entId) {
        return itemSizeRepository.findByEnterpriseEntIdAndIsActiveTrueOrderBySortOrderAscLabelAsc(entId)
                .stream().map(this::sizeToMap).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'sizes-' + #entId")
    public Map<String, Object> createSize(String entId, LookupRequest req) {
        if (itemSizeRepository.existsByLabelAndEnterpriseEntId(req.getName(), entId))
            throw new BadRequestException("Size label already exists: " + req.getName());
        Enterprise ent = getEnterprise(entId);
        ItemSize s = ItemSize.builder()
                .enterprise(ent).label(req.getName())
                .decimalValue(req.getDecimalValue())
                .sizeList(req.getSizeList() != null ? req.getSizeList() : java.util.Collections.emptyList())
                .build();
        return sizeToMap(itemSizeRepository.save(s));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'sizes-' + #entId")
    public Map<String, Object> updateSize(String entId, Integer sizeId, LookupRequest req) {
        ItemSize s = itemSizeRepository.findBySizeIdAndEnterpriseEntId(sizeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Size not found"));
        s.setLabel(req.getName());
        s.setDecimalValue(req.getDecimalValue());
        s.setSizeList(req.getSizeList() != null ? req.getSizeList() : java.util.Collections.emptyList());
        return sizeToMap(itemSizeRepository.save(s));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'sizes-' + #entId")
    public void deleteSize(String entId, Integer sizeId) {
        ItemSize s = itemSizeRepository.findBySizeIdAndEnterpriseEntId(sizeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Size not found"));
        s.setActive(false);
        itemSizeRepository.save(s);
    }

    // ── Brands ────────────────────────────────────────────────────────────────

    @Cacheable(value = "lookups", key = "'brands-' + #entId")
    public List<Map<String, Object>> getBrands(String entId) {
        return itemBrandRepository.findByEnterpriseEntIdAndIsActiveTrueOrderByName(entId)
                .stream().map(this::brandToMap).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'brands-' + #entId")
    public Map<String, Object> createBrand(String entId, LookupRequest req) {
        if (itemBrandRepository.existsByNameAndEnterpriseEntId(req.getName(), entId))
            throw new BadRequestException("Brand already exists: " + req.getName());
        Enterprise ent = getEnterprise(entId);
        ItemBrand b = ItemBrand.builder()
                .enterprise(ent).name(req.getName()).build();
        return brandToMap(itemBrandRepository.save(b));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'brands-' + #entId")
    public Map<String, Object> updateBrand(String entId, Integer brandId, LookupRequest req) {
        ItemBrand b = itemBrandRepository.findByBrandIdAndEnterpriseEntId(brandId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        b.setName(req.getName());
        return brandToMap(itemBrandRepository.save(b));
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'brands-' + #entId")
    public void deleteBrand(String entId, Integer brandId) {
        ItemBrand b = itemBrandRepository.findByBrandIdAndEnterpriseEntId(brandId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found"));
        b.setActive(false);
        itemBrandRepository.save(b);
    }

    // ── All lookups at once (for frontend init) ───────────────────────────────

    public Map<String, Object> getAllLookups(String entId) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("types",    getTypes(entId));
        result.put("subTypes", getSubTypes(entId, null));
        result.put("sizes",    getSizes(entId));
        result.put("brands",   getBrands(entId));
        return result;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> typeToMap(ItemType t) {
        return Map.of("id", t.getTypeId(), "name", t.getName(),
                "description", t.getDescription() != null ? t.getDescription() : "");
    }

    private Map<String, Object> subTypeToMap(ItemSubType s) {
        return Map.of("id", s.getSubTypeId(), "name", s.getName(),
                "typeId", s.getItemType().getTypeId());
    }

    private Map<String, Object> sizeToMap(ItemSize s) {
        Map<String, Object> map = new java.util.HashMap<>();
        map.put("id", s.getSizeId());
        map.put("label", s.getLabel());
        map.put("unit", s.getUnit() != null ? s.getUnit() : "");
        if (s.getDecimalValue() != null) map.put("decimalValue", s.getDecimalValue());
        if (s.getSizeList() != null) map.put("sizeList", s.getSizeList());
        return map;
    }

    private Map<String, Object> brandToMap(ItemBrand b) {
        return Map.of("id", b.getBrandId(), "name", b.getName(),
                "logoUrl", b.getLogoUrl() != null ? b.getLogoUrl() : "");
    }

    private Enterprise getEnterprise(String entId) {
        return enterpriseRepository.findById(entId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found"));
    }
}
