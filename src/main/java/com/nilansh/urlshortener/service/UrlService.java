package com.nilansh.urlshortener.service;

import com.nilansh.urlshortener.dto.ShortenRequest;
import com.nilansh.urlshortener.dto.ShortenResponse;
import com.nilansh.urlshortener.dto.StatsResponse;
import com.nilansh.urlshortener.exception.UrlExpiredException;
import com.nilansh.urlshortener.exception.UrlNotFoundException;
import com.nilansh.urlshortener.model.Url;
import com.nilansh.urlshortener.repository.UrlRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.List;

import static org.springframework.data.mongodb.core.query.Criteria.where;

@Service
public class UrlService {

    private static final int CODE_LENGTH = 6;
    private static final int MAX_COLLISION_RETRIES = 5;

    private final UrlRepository urlRepository;
    private final MongoTemplate mongoTemplate;
    private final String baseUrl;

    public UrlService(UrlRepository urlRepository,
                       MongoTemplate mongoTemplate,
                       @Value("${app.base-url}") String baseUrl) {
        this.urlRepository = urlRepository;
        this.mongoTemplate = mongoTemplate;
        this.baseUrl = baseUrl;
    }

    public ShortenResponse createShortUrl(ShortenRequest request, String userId) {
        String originalUrl = request.getOriginalUrl();

        // Dedup is now per user. Otherwise user B would get user A's link back.
        var existing = urlRepository.findByOriginalUrlAndUserId(originalUrl, userId);
        if (existing.isPresent()) {
            return toResponse(existing.get());
        }

        String shortCode = generateUniqueCode(originalUrl);

        Url url = Url.builder()
                .shortCode(shortCode)
                .originalUrl(originalUrl)
                .clickCount(0L)
                .createdAt(Instant.now())
                .expiresAt(request.getExpiresAt())
                .userId(userId)                       // new: the owner
                .build();

        return toResponse(urlRepository.save(url));
    }

    public String resolveAndTrack(String shortCode) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        // TTL background job runs every ~60s, so also check expiry inline
        // and return 410 proactively instead of a stale redirect.
        if (url.getExpiresAt() != null && url.getExpiresAt().isBefore(Instant.now())) {
            throw new UrlExpiredException(shortCode);
        }

        incrementClickCount(shortCode);
        return url.getOriginalUrl();
    }

    public StatsResponse getStats(String shortCode, String userId) {
        Url url = urlRepository.findByShortCodeAndUserId(shortCode,userId)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));

        return new StatsResponse(
                url.getShortCode(),
                url.getOriginalUrl(),
                url.getClickCount(),
                url.getCreatedAt(),
                url.getExpiresAt()
        );
    }

    public void deleteByShortCode(String shortCode, String userId) {
        Url url = urlRepository.findByShortCodeAndUserId(shortCode, userId)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));
        urlRepository.delete(url);
    }

    public List<Url> listForUser(String userId) {
        return urlRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // --- internals -------------------------------------------------------

    /**
     * Atomically increments clickCount using Mongo's $inc via findAndModify,
     * so concurrent redirects never lose an increment to a lost read-then-write.
     */
    private void incrementClickCount(String shortCode) {
        Query query = new Query(where("shortCode").is(shortCode));
        Update update = new Update().inc("clickCount", 1);
        mongoTemplate.findAndModify(query, update, FindAndModifyOptions.options(), Url.class);
    }

    private String generateUniqueCode(String originalUrl) {
        for (int attempt = 0; attempt <= MAX_COLLISION_RETRIES; attempt++) {
            // Salt with the attempt number so a collision produces a
            // different candidate on retry instead of looping forever.
            String input = originalUrl + (attempt == 0 ? "" : ":" + attempt);
            String candidate = md5Base62(input).substring(0, CODE_LENGTH);

            if (!urlRepository.existsByShortCode(candidate)) {
                return candidate;
            }
        }
        throw new IllegalStateException("Could not generate a unique short code, try again");
    }

    private String md5Base62(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            String encoded = Base62Encoder.encode(hash);
            // Pad in the rare case the encoding is shorter than CODE_LENGTH.
            while (encoded.length() < CODE_LENGTH) {
                encoded = "0" + encoded;
            }
            return encoded;
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 algorithm not available", e);
        }
    }

    private ShortenResponse toResponse(Url url) {
        return new ShortenResponse(
                url.getShortCode(),
                baseUrl + "/" + url.getShortCode(),
                url.getOriginalUrl(),
                url.getCreatedAt(),
                url.getExpiresAt()
        );
    }
    public ShortenResponse updateExpiry(String shortCode, Instant newExpiresAt) {
        Url url = urlRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new UrlNotFoundException(shortCode));
        url.setExpiresAt(newExpiresAt);
        Url saved = urlRepository.save(url);
        return toResponse(saved);
    }
}
