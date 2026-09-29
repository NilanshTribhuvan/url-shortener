package com.nilansh.urlshortener.controller;


import com.nilansh.urlshortener.dto.ShortenRequest;
import com.nilansh.urlshortener.dto.ShortenResponse;
import com.nilansh.urlshortener.dto.StatsResponse;
import com.nilansh.urlshortener.service.UrlService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@Tag(
        name = "URL Management",
        description = "Create, redirect, manage, and view statistics for shortened URLs"
)
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

    @SecurityRequirement(name = "Bearer Authentication")
    @PostMapping("/api/shorten")
    public ResponseEntity<ShortenResponse> shorten(@Valid @RequestBody ShortenRequest request,
                                                   @AuthenticationPrincipal String userId) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(urlService.createShortUrl(request, userId));
    }

    // 302 Found (temporary redirect) - not 301, so browsers never cache
    // the destination and stale expired/updated targets aren't stuck.
   
    @GetMapping("/{code}")
    public ResponseEntity<Void> redirect(@PathVariable String code) {
        String originalUrl = urlService.resolveAndTrack(code);
        return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(originalUrl))
                .build();
    }
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/api/stats/{code}")
    public ResponseEntity<StatsResponse> stats(@PathVariable String code,@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(urlService.getStats(code,userId));
    }
    @SecurityRequirement(name = "Bearer Authentication")
    @DeleteMapping("/api/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code,
                                       @AuthenticationPrincipal String userId) {
        urlService.deleteByShortCode(code, userId);
        return ResponseEntity.noContent().build();
    }
    @SecurityRequirement(name = "Bearer Authentication")
    @GetMapping("/api/urls")
    public ResponseEntity<?> list(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(urlService.listForUser(userId));
    }
    @SecurityRequirement(name = "Bearer Authentication")
    @PutMapping("/api/{code}")
    public ResponseEntity<ShortenResponse> updateExpiry(@PathVariable String code, @RequestBody ShortenRequest request) {
        return ResponseEntity.ok(urlService.updateExpiry(code, request.getExpiresAt()));
    }
}
