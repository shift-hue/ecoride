package com.ecoride.ride.service;

import com.ecoride.carbon.service.CarbonService;
import com.ecoride.common.exception.ApiException;
import com.ecoride.ride.dto.CreateRideRequest;
import com.ecoride.ride.dto.MyRideDto;
import com.ecoride.ride.dto.RideDto;
import com.ecoride.ride.entity.Ride;
import com.ecoride.ride.entity.RideParticipant;
import com.ecoride.ride.repository.RideParticipantRepository;
import com.ecoride.ride.repository.RideRepository;
import com.ecoride.trust.service.TrustService;
import com.ecoride.user.entity.User;
import com.ecoride.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RideService {

    private final RideRepository rideRepository;
    private final RideParticipantRepository participantRepository;
    private final UserRepository userRepository;
    private final TrustService trustService;
    private final CarbonService carbonService;

    @Transactional
    public RideDto createRide(String driverEmail, CreateRideRequest req) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Ride ride = Ride.builder()
                .driver(driver)
                .pickupZone(req.getPickupZone())
                .destination(req.getDestination())
                .departureTime(req.getDepartureTime())
                .availableSeats(req.getAvailableSeats())
                .subscription(req.isSubscription())
                .pricePerSeat(req.getPricePerSeat())
                .build();

        return RideDto.from(rideRepository.save(ride));
    }

    @Transactional
    public void joinRide(String requesterEmail, UUID rideId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Ride ride = getRideOrThrow(rideId);

        if (ride.getDriver().getId().equals(requester.getId())) {
            throw ApiException.badRequest("Driver cannot join their own ride");
        }
        if (ride.getStatus() != Ride.Status.OPEN) {
            throw ApiException.badRequest("Ride is not open for joining");
        }
        if (participantRepository.existsByRideAndUser(ride, requester)) {
            throw ApiException.conflict("Already joined this ride");
        }

        RideParticipant participant = RideParticipant.builder()
                .ride(ride)
                .user(requester)
                .build();
        participantRepository.save(participant);

        // Mark full if no seats remain
        long confirmed = participantRepository.countByRideAndStatus(ride, RideParticipant.Status.CONFIRMED);
        long requested = participantRepository.countByRideAndStatus(ride, RideParticipant.Status.REQUESTED);
        if (confirmed + requested >= ride.getAvailableSeats()) {
            ride.setStatus(Ride.Status.FULL);
            rideRepository.save(ride);
        }
    }

    @Transactional
    public void confirmParticipant(String driverEmail, UUID rideId, UUID userId) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Ride ride = getRideOrThrow(rideId);

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw ApiException.forbidden("Only the driver can confirm participants");
        }

        User participant = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("Participant not found"));

        RideParticipant rp = participantRepository.findByRideAndUser(ride, participant)
                .orElseThrow(() -> ApiException.notFound("Participant has not joined this ride"));

        rp.setStatus(RideParticipant.Status.CONFIRMED);
        participantRepository.save(rp);
    }

    /**
     * Complete a ride: update trust scores and issue carbon credits for all confirmed participants.
     * Wrapped in one transaction for consistency.
     */
    @Transactional
    public void completeRide(String driverEmail, UUID rideId) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Ride ride = getRideOrThrow(rideId);

        if (!ride.getDriver().getId().equals(driver.getId())) {
            throw ApiException.forbidden("Only the driver can complete the ride");
        }
        if (ride.getStatus() == Ride.Status.COMPLETED) {
            throw ApiException.badRequest("Ride already completed");
        }
        if (ride.getStatus() == Ride.Status.CANCELLED) {
            throw ApiException.badRequest("Cancelled ride cannot be completed");
        }

        ride.setStatus(Ride.Status.COMPLETED);
        rideRepository.save(ride);

        List<RideParticipant> confirmed = participantRepository.findByRideAndStatus(
                ride, RideParticipant.Status.CONFIRMED);

        // Update driver stats
        driver.setRidesCompleted(driver.getRidesCompleted() + 1);
        driver.setTrustScore(driver.getTrustScore() + 5);
        userRepository.save(driver);

        for (RideParticipant rp : confirmed) {
            User participant = rp.getUser();
            participant.setRidesCompleted(participant.getRidesCompleted() + 1);
            participant.setTrustScore(participant.getTrustScore() + 3);
            userRepository.save(participant);

            // Trust connection
            trustService.recordSharedRide(driver.getId(), participant.getId());

            // Carbon credits for passenger
            carbonService.recordCarbonSaving(participant, ride);
        }

        // Carbon for driver too
        carbonService.recordCarbonSaving(driver, ride);
    }

    @Transactional
    public void cancelRide(String requesterEmail, UUID rideId) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        Ride ride = getRideOrThrow(rideId);

        if (!ride.getDriver().getId().equals(requester.getId())) {
            throw ApiException.forbidden("Only the driver can cancel the ride");
        }
        if (ride.getStatus() == Ride.Status.COMPLETED) {
            throw ApiException.badRequest("Completed ride cannot be cancelled");
        }

        ride.setStatus(Ride.Status.CANCELLED);
        rideRepository.save(ride);
    }

    @Transactional(readOnly = true)
    public RideDto getRide(UUID rideId) {
        return RideDto.from(getRideOrThrow(rideId));
    }

        @Transactional(readOnly = true)
        public List<MyRideDto> getMyRides(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> ApiException.notFound("User not found"));

        List<MyRideDto> driving = rideRepository.findByDriver_IdOrderByDepartureTimeAsc(user.getId())
            .stream()
            .map(MyRideDto::fromDriverRide)
            .toList();

        List<MyRideDto> passenger = participantRepository.findByUser_IdOrderByRide_DepartureTimeAsc(user.getId())
            .stream()
            .map(rp -> MyRideDto.fromParticipantRide(rp.getRide(), rp))
            .toList();

        return Stream.concat(driving.stream(), passenger.stream())
            .distinct()
            .sorted((a, b) -> a.getDepartureTime().compareTo(b.getDepartureTime()))
            .toList();
        }

    private Ride getRideOrThrow(UUID rideId) {
        return rideRepository.findById(rideId)
                .orElseThrow(() -> ApiException.notFound("Ride not found"));
    }
}
