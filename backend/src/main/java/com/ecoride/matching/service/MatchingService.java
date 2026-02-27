package com.ecoride.matching.service;

import com.ecoride.matching.dto.MatchResultDto;
import com.ecoride.ride.entity.Ride;
import com.ecoride.ride.repository.RideRepository;
import com.ecoride.trust.repository.TrustConnectionRepository;
import com.ecoride.user.entity.User;
import com.ecoride.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchingService {

    private static final int TIME_WINDOW_MINUTES = 30;  // used only for proximity scoring
    private static final int SEARCH_WINDOW_DAYS   = 30; // how far ahead to look for rides
    private static final int TOP_N = 10;

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final TrustConnectionRepository trustConnectionRepository;

    /**
     * Find top-N matching rides for a given zone and requested departure time.
     * Scoring:
     *   - Base: 50 points
     *   - Time proximity (within 30 min): 0–30 points
     *   - Same department as driver: 10 points
     *   - Existing trust connection: 10 points
     */
    @Transactional(readOnly = true)
    public List<MatchResultDto> findMatches(String zone, String destination, Instant requestedTime, String requesterEmail) {
        // Search from 2 hours before requested time through the next 30 days
        Instant from = requestedTime.minus(2, ChronoUnit.HOURS);
        Instant to   = requestedTime.plus(SEARCH_WINDOW_DAYS, ChronoUnit.DAYS);

        List<Ride> candidates = rideRepository.findMatchingRides(zone, destination, from, to, Ride.Status.OPEN);

        User requester = userRepository.findByEmail(requesterEmail).orElse(null);
        UUID requesterId = requester != null ? requester.getId() : null;

        return candidates.stream()
                .map(r -> score(r, requestedTime, requester, requesterId))
                .sorted(Comparator.comparingInt(MatchResultDto::getMatchScore).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());
    }

    private MatchResultDto score(Ride ride, Instant requestedTime, User requester, UUID requesterId) {
        int base = 50;

        // Time proximity: closer = more points (max 30)
        long diffMinutes = Math.abs(ChronoUnit.MINUTES.between(requestedTime, ride.getDepartureTime()));
        int timeScore = Math.max(0, 30 - (int)(diffMinutes));

        // Department match
        int deptBonus = 0;
        if (requester != null
                && requester.getDepartment() != null
                && requester.getDepartment().equalsIgnoreCase(ride.getDriver().getDepartment())) {
            deptBonus = 10;
        }

        // Trust bonus
        int trustBonus = 0;
        if (requesterId != null) {
            boolean hasTrust = trustConnectionRepository
                    .findBetween(requesterId, ride.getDriver().getId())
                    .isPresent();
            trustBonus = hasTrust ? 10 : 0;
        }

        int totalScore = base + timeScore + deptBonus + trustBonus;

        return MatchResultDto.builder()
                .rideId(ride.getId())
                .driverId(ride.getDriver().getId())
                .driverName(ride.getDriver().getName())
                .pickupZone(ride.getPickupZone())
                .destination(ride.getDestination())
                .departureTime(ride.getDepartureTime())
                .availableSeats(ride.getAvailableSeats())
                .matchScore(totalScore)
                .timeProximityScore(timeScore)
                .departmentMatchBonus(deptBonus)
                .trustBonus(trustBonus)
                .build();
    }
}
