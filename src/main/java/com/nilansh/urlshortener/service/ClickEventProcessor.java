package com.nilansh.urlshortener.service;

import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;
import com.nilansh.urlshortener.model.ClickEvent;
import com.nilansh.urlshortener.model.EventStatus;
import org.springframework.data.mongodb.core.FindAndModifyOptions;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.data.domain.Sort;
import java.time.Instant;
import java.util.UUID;

@Service
public class ClickEventProcessor {
    private final MongoTemplate mongoTemplate;

    public ClickEventProcessor(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }


    public ClickEvent claimEvent() {

        Instant now = Instant.now();
        Instant expiryTime = now.minusSeconds(300);

        String token = UUID.randomUUID().toString();

        Query query = new Query(
                new Criteria().orOperator(
                        Criteria.where("status").is(EventStatus.PENDING),
                        new Criteria().andOperator(
                                Criteria.where("status").is(EventStatus.PROCESSING),
                                Criteria.where("claimedAt").lt(expiryTime)
                        )
                )
        );

        Update update = new Update()
                .set("status", EventStatus.PROCESSING)
                .set("claimedAt", now)
                .set("claimToken", token);

        query.with(Sort.by(Sort.Direction.ASC, "clickedAt"));
        return mongoTemplate.findAndModify(
                query,
                update,
                FindAndModifyOptions.options().returnNew(true),
                ClickEvent.class
        );
    }

}
