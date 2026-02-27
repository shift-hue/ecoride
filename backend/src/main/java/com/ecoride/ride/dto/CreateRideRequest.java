package com.ecoride.ride.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import lombok.Data;

import java.time.Instant;

@Data
public class CreateRideRequest {
    @NotBlank
    private String pickupZone;

    @NotBlank
    private String destination;

    @NotNull @Future
    private Instant departureTime;

    @Min(1) @Max(8)
    private int availableSeats;

    private boolean subscription;

    @DecimalMin(value = "0.0", inclusive = false, message = "Price must be greater than 0")
    private BigDecimal pricePerSeat;
}
