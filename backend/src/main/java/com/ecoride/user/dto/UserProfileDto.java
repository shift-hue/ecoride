package com.ecoride.user.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class UserProfileDto {
    private UUID id;
    private String name;
    private String email;
    private String department;
    private Integer year;
    private int trustScore;
    private String trustBadge;   // BRONZE, SILVER, GOLD, PLATINUM
    private int ridesCompleted;
    private int carbonCredits;
    private String vehicleModel;
    private String vehicleNumber;
    private String bio;
    private String preferences;
    private String phoneNumber;
    private boolean phoneVerified;
    private boolean licenseVerified;
    private Instant createdAt;
}
