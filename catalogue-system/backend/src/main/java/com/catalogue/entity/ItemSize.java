package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

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
