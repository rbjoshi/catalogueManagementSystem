package com.catalogue.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 255)
    private String companyName;

    private String companyDomain;
    private String companyEmail;
    private String companyPhone;
    private String companyAddress;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100)
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Valid email required")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @Size(max = 100)
    private String firstName;

    @Size(max = 100)
    private String lastName;
}
