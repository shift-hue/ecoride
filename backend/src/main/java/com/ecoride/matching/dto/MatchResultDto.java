package com.ecoride.matching.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class MatchResultDto {
    private UUID rideId;
    private UUID driverId;
    private String driverName;
    private String pickupZone;
    private String destination;
    private Instant departureTime;
    private int availableSeats;

    /** Composite compatibility score 0-100 */
    private int matchScore;

    /** Breakdown hints */
    private int departmentMatchBonus;
    private int timeProximityScore;
    private int trustBonus;
}
