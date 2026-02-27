package com.ecoride.ride.controller;

import com.ecoride.common.response.ApiResponse;
import com.ecoride.ride.dto.CreateRideRequest;
import com.ecoride.ride.dto.MyRideDto;
import com.ecoride.ride.dto.RideDto;
import com.ecoride.ride.service.RideService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/rides")
@RequiredArgsConstructor
public class RideController {

    private final RideService rideService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<RideDto> create(@AuthenticationPrincipal UserDetails principal,
                                       @Valid @RequestBody CreateRideRequest req) {
        return ApiResponse.ok("Ride created", rideService.createRide(principal.getUsername(), req));
    }

    @GetMapping("/my")
    public ApiResponse<List<MyRideDto>> myRides(@AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(rideService.getMyRides(principal.getUsername()));
    }

    @GetMapping("/{id:[0-9a-fA-F\\-]{36}}")
    public ApiResponse<RideDto> get(@PathVariable UUID id) {
        return ApiResponse.ok(rideService.getRide(id));
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/join")
    public ApiResponse<Void> join(@AuthenticationPrincipal UserDetails principal,
                                  @PathVariable UUID id) {
        rideService.joinRide(principal.getUsername(), id);
        return ApiResponse.ok("Joined ride successfully");
    }

    @PostMapping("/{rideId:[0-9a-fA-F\\-]{36}}/confirm/{userId:[0-9a-fA-F\\-]{36}}")
    public ApiResponse<Void> confirm(@AuthenticationPrincipal UserDetails principal,
                                     @PathVariable UUID rideId,
                                     @PathVariable UUID userId) {
        rideService.confirmParticipant(principal.getUsername(), rideId, userId);
        return ApiResponse.ok("Participant confirmed");
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/complete")
    public ApiResponse<Void> complete(@AuthenticationPrincipal UserDetails principal,
                                      @PathVariable UUID id) {
        rideService.completeRide(principal.getUsername(), id);
        return ApiResponse.ok("Ride completed");
    }

    @PostMapping("/{id:[0-9a-fA-F\\-]{36}}/cancel")
    public ApiResponse<Void> cancel(@AuthenticationPrincipal UserDetails principal,
                                    @PathVariable UUID id) {
        rideService.cancelRide(principal.getUsername(), id);
        return ApiResponse.ok("Ride cancelled");
    }
}
