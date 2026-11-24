
package com.nilansh.urlshortener.service;

import com.nilansh.urlshortener.dto.DailyClickStats;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    private final MongoTemplate mongoTemplate;

    public AnalyticsService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public List<DailyClickStats> getDailyClickStats() {

        Aggregation aggregation = Aggregation.newAggregation(

                Aggregation.project()
                        .and(
                                DateOperators.DateToString
                                        .dateOf("clickedAt")
                                        .toString("%Y-%m-%d")
                        ).as("date"),

                Aggregation.group("date")
                        .count()
                        .as("totalClicks"),

                Aggregation.project("totalClicks")
                        .and("_id")
                        .as("date")
                        .andExclude("_id"),

                Aggregation.sort(Sort.Direction.ASC, "date")
        );

        return mongoTemplate.aggregate(
                aggregation,
                "click_events",
                DailyClickStats.class
        ).getMappedResults();
    }
}
