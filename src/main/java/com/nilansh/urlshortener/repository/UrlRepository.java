package com.nilansh.urlshortener.repository;

import com.nilansh.urlshortener.model.Url;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UrlRepository extends MongoRepository<Url, String> {

    Optional<Url> findByShortCode(String shortCode);

    Optional<Url> findByOriginalUrl(String originalUrl);

    boolean existsByShortCode(String shortCode);

    Optional<Url> findByOriginalUrlAndUserId(String originalUrl, String userId);

    Optional<Url> findByShortCodeAndUserId(String shortCode, String userId);

    List<Url> findByUserIdOrderByCreatedAtDesc(String userId);
}
