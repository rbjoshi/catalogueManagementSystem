package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "items")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "item_id", updatable = false, nullable = false)
    private UUID itemId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ent_id", nullable = false)
    private Enterprise enterprise;

    @Column(length = 100)
    private String sku;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "short_desc", length = 500)
    private String shortDesc;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Column(precision = 15, scale = 2)
    private BigDecimal mrp;

    @Column(length = 10)
    @Builder.Default
    private String currency = "INR";

    @Column(name = "discount_pct", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPct = BigDecimal.ZERO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id")
    private ItemType itemType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_type_id")
    private ItemSubType itemSubType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "size_id")
    private ItemSize itemSize;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id")
    private ItemBrand itemBrand;

    @Column(precision = 10, scale = 3)
    private BigDecimal weight;

    @Column(name = "weight_unit", length = 20)
    private String weightUnit;

    @Column(length = 100)
    private String dimensions;

    @Column(length = 100)
    private String color;

    @Column(length = 200)
    private String material;

    @Column(name = "country_origin", length = 100)
    private String countryOrigin;

    @Column(length = 100)
    private String barcode;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<Map<String, Object>> images = List.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private List<String> tags = List.of();

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> attributes = Map.of();

    @Column(name = "stock_qty")
    @Builder.Default
    private Integer stockQty = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
