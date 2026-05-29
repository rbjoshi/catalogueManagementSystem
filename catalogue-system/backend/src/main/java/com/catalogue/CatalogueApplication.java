/*
 * Copyright (c) 2026. All rights reserved.
 */
package com.catalogue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.TimeZone;

@SpringBootApplication
@EnableCaching
@EnableAsync
public class CatalogueApplication {
    public static void main(String[] args) {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(CatalogueApplication.class, args);
    }
}
