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
    public void deleteType(String entId, Integer typeId) {
        ItemType t = itemTypeRepository.findByTypeIdAndEnterpriseEntId(typeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found"));
        t.setActive(false);
        itemTypeRepository.save(t);
    }

    // ── Sub Types ─────────────────────────────────────────────────────────────

    @Cacheable(value = "lookups", key = "'subtypes-' + #entId + '-' + #typeId")
    public List<Map<String, Object>> getSubTypes(String entId, Integer typeId) {
        List<ItemSubType> list = typeId != null
                ? itemSubTypeRepository.findByItemTypeTypeIdAndEnterpriseEntIdAndIsActiveTrueOrderByName(typeId, entId)
                : itemSubTypeRepository.findByEnterpriseEntIdAndIsActiveTrueOrderByName(entId);
        return list.stream().map(this::subTypeToMap).collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "lookups", key = "'subtypes-' + #entId + '-' + #req.typeId")
    public Map<String, Object> createSubType(String entId, Integer typeId, LookupRequest req) {
        Enterprise ent = getEnterprise(entId);
        ItemType type = itemTypeRepository.findByTypeIdAndEnterpriseEntId(typeId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Type not found"));
        ItemSubType st = ItemSubType.builder()
                .enterprise(ent).itemType(type).name(req.getName()).description(req.getDescription()).build();
        return subTypeToMap(itemSubTypeRepository.save(st));
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
                .enterprise(ent).label(req.getName()).build();
        return sizeToMap(itemSizeRepository.save(s));
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
        return Map.of("id", s.getSizeId(), "label", s.getLabel(),
                "unit", s.getUnit() != null ? s.getUnit() : "");
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
