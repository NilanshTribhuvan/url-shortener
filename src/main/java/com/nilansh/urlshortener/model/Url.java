package com.nilansh.urlshortener.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "urls")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Url {

    @Id
    private String id;

    @Indexed(unique = true)
    private String shortCode;

    @Indexed
    private String originalUrl;

    @Builder.Default
    private long clickCount = 0L;

    private Instant createdAt;

    @Indexed(name = "ttl_expires_at_idx", expireAfterSeconds = 0)
    private Instant expiresAt;

    private String userId;
}
