package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "catalogue_items")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogueItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cat_item_id", updatable = false, nullable = false)
    private UUID catItemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cat_id", nullable = false)
    private Catalogue catalogue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "item_id", nullable = false)
    private Item item;

    @Column(name = "page_number")
    @Builder.Default
    private Integer pageNumber = 1;

    @Column(name = "position")
    @Builder.Default
    private Integer position = 0;

    @Column(name = "custom_name", length = 500)
    private String customName;

    @Column(name = "custom_price", precision = 15, scale = 2)
    private BigDecimal customPrice;

    @Column(name = "custom_desc", columnDefinition = "TEXT")
    private String customDesc;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "custom_overrides", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> customOverrides = Map.of();

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
