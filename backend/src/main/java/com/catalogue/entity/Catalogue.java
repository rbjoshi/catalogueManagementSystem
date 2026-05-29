/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "catalogues")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Catalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "cat_id", updatable = false, nullable = false)
    private UUID catId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ent_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private CatalogueTemplate template;

    @Column(nullable = false, length = 500)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_json", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> layoutJson = Map.of();

    @Column(name = "page_size", length = 20)
    @Builder.Default
    private String pageSize = "A4";

    @Column(length = 20)
    @Builder.Default
    private String orientation = "PORTRAIT";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Status status = Status.DRAFT;

    @Column(name = "cover_image")
    private String coverImage;

    @Column(name = "item_count")
    @Builder.Default
    private Integer itemCount = 0;

    @Column(nullable = false)
    @Builder.Default
    private Integer version = 1;

    @Column(name = "published_at")
    private ZonedDateTime publishedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "catalogue", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CatalogueItem> catalogueItems = new ArrayList<>();

    public enum Status {
        DRAFT, PUBLISHED, ARCHIVED
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
    }
}
