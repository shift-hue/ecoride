package com.ecoride.trust.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class TrustProfileDto {
    @Data
    @Builder
    public static class TopConnectionDto {
        private UUID userId;
        private String name;
        private int mutualRides;
    }

    private UUID userId;
    private String name;
    private int trustScore;
    private String badge;           // BRONZE, SILVER, GOLD, PLATINUM
    private int ridesCompleted;
    private int uniqueRidePartners;
    private List<TopConnectionDto> topConnections;
}
