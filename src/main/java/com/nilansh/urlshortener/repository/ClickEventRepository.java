package com.nilansh.urlshortener.repository;

import com.nilansh.urlshortener.model.ClickEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ClickEventRepository extends MongoRepository<ClickEvent, String> {
}
