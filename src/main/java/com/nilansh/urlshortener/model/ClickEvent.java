package com.nilansh.urlshortener.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "click_events")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClickEvent {

    @Id
    private String id;

    private String shortCode;

    private Instant clickedAt;

    // Store a SHA-256 hash of the IP, never the raw address (privacy).
    private String ipAddressHash;

    private String userAgent;

    private String country;
}
