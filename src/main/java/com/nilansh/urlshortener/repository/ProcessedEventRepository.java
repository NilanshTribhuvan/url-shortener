package com.nilansh.urlshortener.repository;

import com.nilansh.urlshortener.model.ProcessedEvent;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProcessedEventRepository extends MongoRepository<ProcessedEvent,String> {

}
