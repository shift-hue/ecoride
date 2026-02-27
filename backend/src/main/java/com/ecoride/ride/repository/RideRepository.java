package com.ecoride.ride.repository;

import com.ecoride.ride.entity.Ride;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface RideRepository extends JpaRepository<Ride, UUID> {

    /**
     * Core matching engine query — zone partial/case-insensitive match, time window, OPEN status.
     */
    @Query("SELECT r FROM Ride r " +
           "WHERE LOWER(r.pickupZone) LIKE LOWER(CONCAT('%', :zone, '%')) " +
           "AND (:destination IS NULL OR :destination = '' OR LOWER(r.destination) LIKE LOWER(CONCAT('%', :destination, '%'))) " +
           "AND r.departureTime BETWEEN :from AND :to " +
           "AND r.status = :status " +
           "ORDER BY r.departureTime ASC")
    List<Ride> findMatchingRides(@Param("zone") String zone,
                                  @Param("destination") String destination,
                                  @Param("from") Instant from,
                                  @Param("to") Instant to,
                                  @Param("status") Ride.Status status);

    List<Ride> findByDriver_Id(UUID driverId);

    List<Ride> findByDriver_IdOrderByDepartureTimeAsc(UUID driverId);
}
