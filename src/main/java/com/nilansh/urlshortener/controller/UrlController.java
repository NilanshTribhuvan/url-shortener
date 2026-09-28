package com.nilansh.urlshortener.controller;


import com.nilansh.urlshortener.dto.ShortenRequest;
import com.nilansh.urlshortener.dto.ShortenResponse;
import com.nilansh.urlshortener.dto.StatsResponse;
import com.nilansh.urlshortener.service.UrlService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
public class UrlController {

    private final UrlService urlService;

    public UrlController(UrlService urlService) {
        this.urlService = urlService;
    }

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

    @GetMapping("/api/stats/{code}")
    public ResponseEntity<StatsResponse> stats(@PathVariable String code,@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(urlService.getStats(code,userId));
    }

    @DeleteMapping("/api/{code}")
    public ResponseEntity<Void> delete(@PathVariable String code,
                                       @AuthenticationPrincipal String userId) {
        urlService.deleteByShortCode(code, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/api/urls")
    public ResponseEntity<?> list(@AuthenticationPrincipal String userId) {
        return ResponseEntity.ok(urlService.listForUser(userId));
    }

    @PutMapping("/api/{code}")
    public ResponseEntity<ShortenResponse> updateExpiry(@PathVariable String code, @RequestBody ShortenRequest request) {
        return ResponseEntity.ok(urlService.updateExpiry(code, request.getExpiresAt()));
    }
}
