package com.nilansh.urlshortener.service;

import com.nilansh.urlshortener.model.ClickEvent;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class ClickEventTestRunner {

    @Bean
    public ApplicationRunner testClickEvent(
            ClickEventProcessor processor) {

        return args -> {
            ClickEvent event = processor.claimEvent();

            if (event == null) {
                System.out.println("No pending events found");
                return;
            }

            processor.processEvent(event);

            System.out.println(
                    "Processed event: " + event.getId()
            );
        };
    }
}