package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "enterprise")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enterprise {

    @Id
    @Column(name = "ent_id", length = 35, nullable = false, updatable = false)
    private String entId;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private Plan plan = Plan.FREE;

    @Column(name = "logo_url")
    private String logoUrl;

    private String address;
    private String phone;
    private String email;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "enterprise", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<User> users = new ArrayList<>();

    public enum Plan {
        FREE, BASIC, PRO, ENTERPRISE
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = ZonedDateTime.now();
        if (updatedAt == null) updatedAt = ZonedDateTime.now();
    }
}
