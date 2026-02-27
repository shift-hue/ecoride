package com.ecoride.ride.dto;

import com.ecoride.ride.entity.Ride;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class RideDto {
    private UUID id;
    private UUID driverId;
    private String driverName;
    private String pickupZone;
    private String destination;
    private Instant departureTime;
    private int availableSeats;
    private Ride.Status status;
    private boolean subscription;
    private java.math.BigDecimal pricePerSeat;
    private Instant createdAt;

    public static RideDto from(com.ecoride.ride.entity.Ride ride) {
        return RideDto.builder()
                .id(ride.getId())
                .driverId(ride.getDriver().getId())
                .driverName(ride.getDriver().getName())
                .pickupZone(ride.getPickupZone())
                .destination(ride.getDestination())
                .departureTime(ride.getDepartureTime())
                .availableSeats(ride.getAvailableSeats())
                .status(ride.getStatus())
                .subscription(ride.isSubscription())
                .pricePerSeat(ride.getPricePerSeat())
                .createdAt(ride.getCreatedAt())
                .build();
    }
}
