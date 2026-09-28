package com.nilansh.urlshortener.dto;

public record AuthResponse(String token, String userId, String email) {
}
