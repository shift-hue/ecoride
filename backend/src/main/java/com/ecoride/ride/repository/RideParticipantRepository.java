package com.ecoride.ride.repository;

import com.ecoride.ride.entity.Ride;
import com.ecoride.ride.entity.RideParticipant;
import com.ecoride.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RideParticipantRepository extends JpaRepository<RideParticipant, UUID> {
    Optional<RideParticipant> findByRideAndUser(Ride ride, User user);
    List<RideParticipant> findByRideAndStatus(Ride ride, RideParticipant.Status status);
    List<RideParticipant> findByUser_IdOrderByRide_DepartureTimeAsc(UUID userId);
    List<RideParticipant> findByRide_Driver_Id(UUID driverId);
    boolean existsByRideAndUser(Ride ride, User user);
    long countByRideAndStatus(Ride ride, RideParticipant.Status status);
}
