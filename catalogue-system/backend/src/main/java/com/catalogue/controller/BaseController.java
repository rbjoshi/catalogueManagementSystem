/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue.controller;

import com.catalogue.security.CatalogueUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.UUID;

public abstract class BaseController {

    protected CatalogueUserDetails currentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (CatalogueUserDetails) auth.getPrincipal();
    }

    protected String currentEntId() {
        return currentUser().getEntId();
    }

    protected UUID currentUserId() {
        return UUID.fromString(currentUser().getUserId());
    }
}
