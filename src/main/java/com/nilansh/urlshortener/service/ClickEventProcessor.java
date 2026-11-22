package com.nilansh.urlshortener.service;

import com.mongodb.client.result.UpdateResult;
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
import com.nilansh.urlshortener.repository.ProcessedEventRepository;
import com.nilansh.urlshortener.model.Url;
import com.nilansh.urlshortener.model.ProcessedEvent;
import org.springframework.transaction.annotation.Transactional;
import static org.springframework.data.mongodb.core.query.Criteria.where;


@Service
public class ClickEventProcessor {
    private final MongoTemplate mongoTemplate;

    private final ProcessedEventRepository processedEventRepository;

    public ClickEventProcessor(
            MongoTemplate mongoTemplate,
            ProcessedEventRepository processedEventRepository) {

        this.mongoTemplate = mongoTemplate;
        this.processedEventRepository = processedEventRepository;
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




    @Transactional
    public void processEvent(ClickEvent event) {


        if (processedEventRepository.existsById(event.getId())) {
            return;
        }


        Query claimQuery = new Query(
                where("_id").is(event.getId())
                        .and("claimToken").is(event.getClaimToken())
                        .and("status").is(EventStatus.PROCESSING)
        );

        Update eventUpdate = new Update()
                .set("status", EventStatus.PROCESSED);

        UpdateResult result = mongoTemplate.updateFirst(
                claimQuery,
                eventUpdate,
                ClickEvent.class
        );
        if (result.getModifiedCount() == 0) {
            return;
        }
        Query urlQuery = new Query(
                where("shortCode").is(event.getShortCode())
        );

        Update urlUpdate = new Update()
                .inc("clickCount", 1);

        mongoTemplate.updateFirst(urlQuery, urlUpdate, Url.class);
        ProcessedEvent processedEvent = new ProcessedEvent(
                event.getId(),
                Instant.now()
        );

        processedEventRepository.save(processedEvent);
    }
    public void processNextEvent() {

        ClickEvent event = claimEvent();

        if (event == null) {
            System.out.println("No pending events found");
            return;
        }

        processEvent(event);

        System.out.println("Processed event: " + event.getId());
    }
}
