package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.List;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "item_size")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemSize {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "size_id")
    private Integer sizeId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ent_id", nullable = false)
    private Enterprise enterprise;

    @Column(nullable = false, length = 100)
    private String label;

    @Column(length = 50)
    private String unit;

    @Column(name = "decimal_value", precision = 15, scale = 2)
    private BigDecimal decimalValue;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "size_list", columnDefinition = "jsonb")
    private List<String> sizeList;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
