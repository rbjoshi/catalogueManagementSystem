package com.catalogue.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LookupRequest {
    @NotBlank @Size(max = 150)
    private String name;
    private String description;
    private Boolean isActive = true;
}
