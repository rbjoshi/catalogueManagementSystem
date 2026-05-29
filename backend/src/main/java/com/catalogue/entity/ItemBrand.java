/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;

@Entity
@Table(name = "item_brand")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemBrand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "brand_id")
    private Integer brandId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ent_id", nullable = false)
    private Enterprise enterprise;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(length = 255)
    private String website;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
