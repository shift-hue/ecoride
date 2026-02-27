package com.ecoride.user.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(length = 100)
    private String department;

    private Integer year;

    @Column(name = "trust_score", nullable = false)
    @Builder.Default
    private int trustScore = 0;

    @Column(name = "rides_completed", nullable = false)
    @Builder.Default
    private int ridesCompleted = 0;

    @Column(name = "carbon_credits", nullable = false)
    @Builder.Default
    private int carbonCredits = 0;

    @Column(name = "vehicle_model", length = 100)
    private String vehicleModel;

    @Column(name = "vehicle_number", length = 30)
    private String vehicleNumber;

    @Column(length = 500)
    private String bio;

    // Comma-separated preference tags, e.g. "Non-smoker,Music friendly,Pets ok"
    @Column(length = 200)
    private String preferences;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "phone_verified", nullable = false)
    @Builder.Default
    private boolean phoneVerified = false;

    @Column(name = "license_verified", nullable = false)
    @Builder.Default
    private boolean licenseVerified = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;
}
