package com.ecoride.ride.dto;

import com.ecoride.ride.entity.Ride;
import com.ecoride.ride.entity.RideParticipant;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class MyRideDto {
    private UUID rideId;
    private String role; // DRIVER | PASSENGER
    private RideParticipant.Status participantStatus;
    private UUID driverId;
    private String driverName;
    private String pickupZone;
    private String destination;
    private Instant departureTime;
    private int availableSeats;
    private Ride.Status rideStatus;
    private BigDecimal pricePerSeat;

    public static MyRideDto fromDriverRide(Ride ride) {
        return MyRideDto.builder()
                .rideId(ride.getId())
                .role("DRIVER")
                .participantStatus(RideParticipant.Status.CONFIRMED)
                .driverId(ride.getDriver().getId())
                .driverName(ride.getDriver().getName())
                .pickupZone(ride.getPickupZone())
                .departureTime(ride.getDepartureTime())
                .availableSeats(ride.getAvailableSeats())
                .rideStatus(ride.getStatus())
                .pricePerSeat(ride.getPricePerSeat())
                .build();
    }

    public static MyRideDto fromParticipantRide(Ride ride, RideParticipant participant) {
        return MyRideDto.builder()
                .rideId(ride.getId())
                .role("PASSENGER")
                .participantStatus(participant.getStatus())
                .driverId(ride.getDriver().getId())
                .driverName(ride.getDriver().getName())
                .pickupZone(ride.getPickupZone())
                .departureTime(ride.getDepartureTime())
                .availableSeats(ride.getAvailableSeats())
                .rideStatus(ride.getStatus())
                .pricePerSeat(ride.getPricePerSeat())
                .build();
    }
}