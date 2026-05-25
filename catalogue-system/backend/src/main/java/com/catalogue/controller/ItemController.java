package com.catalogue.controller;

import com.catalogue.dto.request.ItemRequest;
import com.catalogue.dto.response.ApiResponse;
import com.catalogue.dto.response.ItemResponse;
import com.catalogue.service.ItemService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/items")
@RequiredArgsConstructor
@Tag(name = "Items")
public class ItemController extends BaseController {

    private final ItemService itemService;

    @GetMapping
    @Operation(summary = "List / search items for current enterprise")
    public ApiResponse<Page<ItemResponse>> getItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer typeId,
            @RequestParam(required = false) Integer subTypeId,
            @RequestParam(required = false) Integer brandId,
            @RequestParam(required = false) Integer sizeId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        return ApiResponse.ok(itemService.getItems(
                currentEntId(), search, typeId, subTypeId, brandId, sizeId, pageable));
    }

    @GetMapping("/{itemId}")
    @Operation(summary = "Get a single item")
    public ApiResponse<ItemResponse> getItem(@PathVariable UUID itemId) {
        return ApiResponse.ok(itemService.getItem(currentEntId(), itemId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new item")
    public ApiResponse<ItemResponse> createItem(@Valid @RequestBody ItemRequest req) {
        return ApiResponse.ok("Item created", itemService.createItem(currentEntId(), currentUserId(), req));
    }

    @PutMapping("/{itemId}")
    @Operation(summary = "Update an item")
    public ApiResponse<ItemResponse> updateItem(
            @PathVariable UUID itemId,
            @Valid @RequestBody ItemRequest req) {
        return ApiResponse.ok("Item updated", itemService.updateItem(currentEntId(), itemId, req));
    }

    @DeleteMapping("/{itemId}")
    @Operation(summary = "Soft-delete an item")
    public ApiResponse<Void> deleteItem(@PathVariable UUID itemId) {
        itemService.deleteItem(currentEntId(), itemId);
        return ApiResponse.ok("Item deleted", null);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Bulk create items")
    public ApiResponse<List<ItemResponse>> bulkCreate(@RequestBody List<@Valid ItemRequest> requests) {
        return ApiResponse.ok("Items created",
                itemService.bulkCreate(currentEntId(), currentUserId(), requests));
    }
}
