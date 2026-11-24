
package com.nilansh.urlshortener.service;

import com.nilansh.urlshortener.dto.DailyClickStats;
import com.nilansh.urlshortener.dto.TrafficSourceStats;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.ConditionalOperators;
import org.springframework.data.mongodb.core.aggregation.DateOperators;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.nilansh.urlshortener.dto.HotLinkStats;
import org.springframework.data.mongodb.core.aggregation.LookupOperation;

import java.util.List;

@Service
public class AnalyticsService {

    private final MongoTemplate mongoTemplate;

    public AnalyticsService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }



    public List<TrafficSourceStats> getTrafficSources() {

        Aggregation aggregation = Aggregation.newAggregation(

                // 1. Replace missing referrer values with UNKNOWN
                Aggregation.project()
                        .and(ConditionalOperators.ifNull("referrer")
                                .then("UNKNOWN"))
                        .as("referrer"),

                // 2. Group events by referrer
                Aggregation.group("referrer")
                        .count()
                        .as("totalClicks"),

                // 3. Map the group ID to referrer
                Aggregation.project("totalClicks")
                        .and("_id")
                        .as("referrer")
                        .andExclude("_id"),

                // 4. Sort by clicks, highest first
                Aggregation.sort(
                        Sort.Direction.DESC,
                        "totalClicks"
                )
        );

        return mongoTemplate.aggregate(
                aggregation,
                "click_events",
                TrafficSourceStats.class
        ).getMappedResults();
    }


    public long getTotalClicks() {

        return mongoTemplate.getCollection("click_events")
                .countDocuments();
    }



    public List<HotLinkStats> getHotLinks() {

        Aggregation aggregation = Aggregation.newAggregation(


                Aggregation.group("shortCode")
                        .count()
                        .as("totalClicks"),


                Aggregation.lookup(
                        "urls",
                        "_id",
                        "shortCode",
                        "urlDetails"
                ),


                Aggregation.unwind("urlDetails"),

                // 4. Select the response fields
                Aggregation.project("totalClicks")
                        .and("_id")
                        .as("shortCode")
                        .and("urlDetails.originalUrl")
                        .as("originalUrl")
                        .andExclude("_id"),


                Aggregation.sort(
                        Sort.Direction.DESC,
                        "totalClicks"
                )
        );

        return mongoTemplate.aggregate(
                aggregation,
                "click_events",
                HotLinkStats.class
        ).getMappedResults();
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
