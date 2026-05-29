/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.controller;

import com.catalogue.dto.response.ApiResponse;
import com.catalogue.service.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@Tag(name = "Upload", description = "File Upload APIs")
public class FileUploadController {

    private final StorageService storageService;

    @PostMapping
    @Operation(summary = "Upload a file")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadFile(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.store(file);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("url", fileUrl)));
    }
}
