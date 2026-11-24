package com.nilansh.urlshortener.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HotLinkStats {

    private String shortCode;

    private String originalUrl;

    private long totalClicks;
}
