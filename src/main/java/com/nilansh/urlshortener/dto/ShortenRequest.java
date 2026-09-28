package com.nilansh.urlshortener.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.Instant;

public class ShortenRequest {

    @NotBlank(message = "originalUrl is required")
    private String originalUrl;

    // Optional. If present, a TTL index will expire the document at this instant.
    private Instant expiresAt;

    public String getOriginalUrl() {
        return originalUrl;
    }

    public void setOriginalUrl(String originalUrl) {
        this.originalUrl = originalUrl;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }
}
