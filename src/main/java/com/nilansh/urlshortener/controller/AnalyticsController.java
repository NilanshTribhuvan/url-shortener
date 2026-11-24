package com.nilansh.urlshortener.controller;

import com.nilansh.urlshortener.dto.DailyClickStats;
import com.nilansh.urlshortener.dto.TrafficSourceStats;
import com.nilansh.urlshortener.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.nilansh.urlshortener.dto.HotLinkStats;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/daily-clicks")
    public List<DailyClickStats> getDailyClickStats() {
        return analyticsService.getDailyClickStats();
    }

    @GetMapping("/hot-links")
    public List<HotLinkStats> getHotLinks() {
        return analyticsService.getHotLinks();
    }

    @GetMapping("/traffic-sources")
    public List<TrafficSourceStats> getTrafficSources() {
        return analyticsService.getTrafficSources();
    }

    @GetMapping("/total-clicks")
    public long getTotalClicks() {
        return analyticsService.getTotalClicks();
    }

}
