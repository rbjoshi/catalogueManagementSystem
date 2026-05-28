package com.catalogue.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.math.BigDecimal;
import java.util.Map;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CatalogueItemResponse {
    private ItemResponse item;
    private Integer pageNumber;
    private Integer position;
    private String customName;
    private BigDecimal customPrice;
    private String customDesc;
    private Map<String, Object> customOverrides;
}
