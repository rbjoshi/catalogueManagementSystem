package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.ZonedDateTime;
import java.util.Map;

@Entity
@Table(name = "catalogue_templates")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CatalogueTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "template_id")
    private Integer templateId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "layout_config", columnDefinition = "jsonb")
    @Builder.Default
    private Map<String, Object> layoutConfig = Map.of();

    @Column(name = "page_size", length = 20)
    @Builder.Default
    private String pageSize = "A4";

    @Column(name = "is_system")
    @Builder.Default
    private boolean isSystem = true;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();
}
