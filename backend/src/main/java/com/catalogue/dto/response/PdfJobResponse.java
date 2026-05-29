/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.dto.response;

import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PdfJobResponse {
    private UUID jobId;
    private UUID catId;
    private String status;
    private String fileUrl;
    private String errorMsg;
    private ZonedDateTime createdAt;
    private ZonedDateTime completedAt;
}
