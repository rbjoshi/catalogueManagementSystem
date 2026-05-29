/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CatalogueResponse {
    private UUID catId;
    private String entId;
    private String name;
    private String description;
    private Map<String, Object> layoutJson;
    private String pageSize;
    private String orientation;
    private String status;
    private String coverImage;
    private Integer itemCount;
    private Integer version;
    private Integer templateId;
    private String templateName;
    private ZonedDateTime publishedAt;
    private ZonedDateTime createdAt;
    private ZonedDateTime updatedAt;
    private List<CatalogueItemResponse> items;
}
