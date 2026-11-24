package com.nilansh.urlshortener.controller;

import com.nilansh.urlshortener.dto.DailyClickStats;
import com.nilansh.urlshortener.service.AnalyticsService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
}
