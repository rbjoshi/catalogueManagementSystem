package com.catalogue.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "pdf_jobs")
@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PdfJob {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "job_id", updatable = false, nullable = false)
    private UUID jobId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cat_id", nullable = false)
    private Catalogue catalogue;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ent_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private Status status = Status.PENDING;

    @Column(name = "file_url")
    private String fileUrl;

    @Column(name = "error_msg")
    private String errorMsg;

    @Column(name = "started_at")
    private ZonedDateTime startedAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private ZonedDateTime createdAt = ZonedDateTime.now();

    public enum Status {
        PENDING, PROCESSING, DONE, FAILED
    }
}
