package com.nilansh.urlshortener.service;

import com.nilansh.urlshortener.model.ClickEvent;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ClickEventWorker {

    private final ClickEventProcessor processor;

    public ClickEventWorker(ClickEventProcessor processor) {
        this.processor = processor;
    }

    @Scheduled(fixedDelay = 1000)
    public void processPendingEvents() {

        try {
            ClickEvent event = processor.claimEvent();

            if (event == null) {
                return;
            }

            processor.processEvent(event);

            System.out.println(
                    "Processed event: " + event.getId()
            );

        } catch (Exception e) {
            System.err.println(
                    "Error processing click event: " + e.getMessage()
            );
        }
    }
}