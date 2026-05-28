package com.catalogue.service;

import com.catalogue.dto.request.ItemRequest;
import com.catalogue.dto.response.ItemResponse;
import com.catalogue.entity.*;
import com.catalogue.exception.BadRequestException;
import com.catalogue.exception.ResourceNotFoundException;
import com.catalogue.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ItemService {

    private final ItemRepository itemRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final ItemTypeRepository itemTypeRepository;
    private final ItemSubTypeRepository itemSubTypeRepository;
    private final ItemSizeRepository itemSizeRepository;
    private final ItemBrandRepository itemBrandRepository;
    private final UserRepository userRepository;

    @Transactional
    @CacheEvict(value = "items", key = "#entId")
    public ItemResponse createItem(String entId, UUID userId, ItemRequest req) {
        Enterprise enterprise = getEnterprise(entId);

        if (req.getSku() != null && itemRepository.existsBySkuAndEnterpriseEntId(req.getSku(), entId)) {
            throw new BadRequestException("SKU already exists: " + req.getSku());
        }

        Item item = buildItem(req, enterprise, userId);
        item = itemRepository.save(item);
        log.info("Item created: itemId={}, entId={}", item.getItemId(), entId);
        return toResponse(item);
    }

    @Transactional
    @CacheEvict(value = "items", key = "#entId")
    public ItemResponse updateItem(String entId, UUID itemId, ItemRequest req) {
        Item item = itemRepository.findByItemIdAndEnterpriseEntId(itemId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        applyUpdates(item, req, entId);
        item = itemRepository.save(item);
        return toResponse(item);
    }

    public Page<ItemResponse> getItems(String entId, String search, Integer typeId,
                                       Integer subTypeId, Integer brandId, Integer sizeId,
                                       Pageable pageable) {
        String searchTerm = (search != null && !search.isBlank()) ? "%" + search.toLowerCase() + "%" : null;
        Page<Item> items = itemRepository.searchItems(entId, searchTerm, typeId, subTypeId, brandId, sizeId, pageable);
        return items.map(this::toResponse);
    }

    public ItemResponse getItem(String entId, UUID itemId) {
        return toResponse(itemRepository.findByItemIdAndEnterpriseEntId(itemId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found")));
    }

    @Transactional
    @CacheEvict(value = "items", key = "#entId")
    public void deleteItem(String entId, UUID itemId) {
        Item item = itemRepository.findByItemIdAndEnterpriseEntId(itemId, entId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));
        item.setActive(false);
        itemRepository.save(item);
    }

    @Transactional
    @CacheEvict(value = "items", key = "#entId")
    public List<ItemResponse> bulkCreate(String entId, UUID userId, List<ItemRequest> requests) {
        Enterprise enterprise = getEnterprise(entId);
        return requests.stream()
                .map(req -> {
                    Item item = buildItem(req, enterprise, userId);
                    return toResponse(itemRepository.save(item));
                })
                .collect(Collectors.toList());
    }

    private Item buildItem(ItemRequest req, Enterprise enterprise, UUID userId) {
        String entId = enterprise.getEntId();
        Item.ItemBuilder builder = Item.builder()
                .enterprise(enterprise)
                .sku(req.getSku())
                .name(req.getName())
                .description(req.getDescription())
                .shortDesc(req.getShortDesc())
                .price(req.getPrice())
                .mrp(req.getMrp())
                .currency(req.getCurrency() != null ? req.getCurrency() : "INR")
                .discountPct(req.getDiscountPct())
                .weight(req.getWeight())
                .weightUnit(req.getWeightUnit())
                .dimensions(req.getDimensions())
                .color(req.getColor())
                .material(req.getMaterial())
                .countryOrigin(req.getCountryOrigin())
                .barcode(req.getBarcode())
                .images(req.getImages() != null ? req.getImages() : List.of())
                .tags(req.getTags() != null ? req.getTags() : List.of())
                .attributes(req.getAttributes() != null ? req.getAttributes() : java.util.Map.of())
                .stockQty(req.getStockQty() != null ? req.getStockQty() : 0)
                .isActive(req.getIsActive() != null ? req.getIsActive() : true);

        if (userId != null) {
            userRepository.findById(userId).ifPresent(builder::createdBy);
        }
        if (req.getTypeId() != null) {
            itemTypeRepository.findByTypeIdAndEnterpriseEntId(req.getTypeId(), entId)
                    .ifPresent(builder::itemType);
        }
        if (req.getSubTypeId() != null) {
            itemSubTypeRepository.findBySubTypeIdAndEnterpriseEntId(req.getSubTypeId(), entId)
                    .ifPresent(builder::itemSubType);
        }
        if (req.getSizeId() != null) {
            itemSizeRepository.findBySizeIdAndEnterpriseEntId(req.getSizeId(), entId)
                    .ifPresent(builder::itemSize);
        }
        if (req.getBrandId() != null) {
            itemBrandRepository.findByBrandIdAndEnterpriseEntId(req.getBrandId(), entId)
                    .ifPresent(builder::itemBrand);
        }
        return builder.build();
    }

    private void applyUpdates(Item item, ItemRequest req, String entId) {
        if (req.getName() != null) item.setName(req.getName());
        if (req.getDescription() != null) item.setDescription(req.getDescription());
        if (req.getShortDesc() != null) item.setShortDesc(req.getShortDesc());
        if (req.getPrice() != null) item.setPrice(req.getPrice());
        if (req.getMrp() != null) item.setMrp(req.getMrp());
        if (req.getCurrency() != null) item.setCurrency(req.getCurrency());
        if (req.getDiscountPct() != null) item.setDiscountPct(req.getDiscountPct());
        if (req.getWeight() != null) item.setWeight(req.getWeight());
        if (req.getWeightUnit() != null) item.setWeightUnit(req.getWeightUnit());
        if (req.getDimensions() != null) item.setDimensions(req.getDimensions());
        if (req.getColor() != null) item.setColor(req.getColor());
        if (req.getMaterial() != null) item.setMaterial(req.getMaterial());
        if (req.getBarcode() != null) item.setBarcode(req.getBarcode());
        if (req.getImages() != null) item.setImages(req.getImages());
        if (req.getTags() != null) item.setTags(req.getTags());
        if (req.getAttributes() != null) item.setAttributes(req.getAttributes());
        if (req.getStockQty() != null) item.setStockQty(req.getStockQty());
        if (req.getIsActive() != null) item.setActive(req.getIsActive());
        if (req.getTypeId() != null) {
            itemTypeRepository.findByTypeIdAndEnterpriseEntId(req.getTypeId(), entId)
                    .ifPresent(item::setItemType);
        }
        if (req.getSubTypeId() != null) {
            itemSubTypeRepository.findBySubTypeIdAndEnterpriseEntId(req.getSubTypeId(), entId)
                    .ifPresent(item::setItemSubType);
        }
        if (req.getSizeId() != null) {
            itemSizeRepository.findBySizeIdAndEnterpriseEntId(req.getSizeId(), entId)
                    .ifPresent(item::setItemSize);
        }
        if (req.getBrandId() != null) {
            itemBrandRepository.findByBrandIdAndEnterpriseEntId(req.getBrandId(), entId)
                    .ifPresent(item::setItemBrand);
        }
    }

    public ItemResponse toResponse(Item item) {
        ItemResponse.ItemResponseBuilder b = ItemResponse.builder()
                .itemId(item.getItemId())
                .entId(item.getEnterprise().getEntId())
                .sku(item.getSku())
                .name(item.getName())
                .description(item.getDescription())
                .shortDesc(item.getShortDesc())
                .price(item.getPrice())
                .mrp(item.getMrp())
                .currency(item.getCurrency())
                .discountPct(item.getDiscountPct())
                .weight(item.getWeight())
                .weightUnit(item.getWeightUnit())
                .dimensions(item.getDimensions())
                .color(item.getColor())
                .material(item.getMaterial())
                .countryOrigin(item.getCountryOrigin())
                .barcode(item.getBarcode())
                .images(item.getImages())
                .tags(item.getTags())
                .attributes(item.getAttributes())
                .stockQty(item.getStockQty())
                .isActive(item.isActive())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt());

        if (item.getItemType() != null)
            b.itemType(new ItemResponse.LookupResponse(item.getItemType().getTypeId(), item.getItemType().getName()));
        if (item.getItemSubType() != null)
            b.itemSubType(new ItemResponse.LookupResponse(item.getItemSubType().getSubTypeId(), item.getItemSubType().getName()));
        if (item.getItemSize() != null)
            b.itemSize(new ItemResponse.SizeResponse(item.getItemSize().getSizeId(), item.getItemSize().getLabel(), item.getItemSize().getUnit()));
        if (item.getItemBrand() != null)
            b.itemBrand(new ItemResponse.LookupResponse(item.getItemBrand().getBrandId(), item.getItemBrand().getName()));

        return b.build();
    }

    private Enterprise getEnterprise(String entId) {
        return enterpriseRepository.findById(entId)
                .orElseThrow(() -> new ResourceNotFoundException("Enterprise not found"));
    }
}
