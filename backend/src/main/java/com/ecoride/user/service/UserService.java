package com.ecoride.user.service;

import com.ecoride.common.exception.ApiException;
import com.ecoride.user.dto.UpdateUserRequest;
import com.ecoride.user.dto.UserProfileDto;
import com.ecoride.user.entity.User;
import com.ecoride.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserProfileDto getByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return toDto(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getById(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        return toDto(user);
    }

    public User getEntityByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    @Transactional
    public UserProfileDto updateMe(String email, UpdateUserRequest req) {
        User user = getEntityByEmail(email);
        user.setName(req.getName());
        if (req.getDepartment() != null) user.setDepartment(req.getDepartment());
        if (req.getYear() != null)        user.setYear(req.getYear());
        if (req.getVehicleModel() != null) user.setVehicleModel(req.getVehicleModel());
        if (req.getVehicleNumber() != null) user.setVehicleNumber(req.getVehicleNumber());
        if (req.getBio() != null)          user.setBio(req.getBio());
        if (req.getPreferences() != null)  user.setPreferences(req.getPreferences());
        if (req.getPhoneNumber() != null)  user.setPhoneNumber(req.getPhoneNumber());
        if (req.getPhoneVerified() != null) user.setPhoneVerified(req.getPhoneVerified());
        if (req.getLicenseVerified() != null) user.setLicenseVerified(req.getLicenseVerified());
        userRepository.save(user);
        return toDto(user);
    }

    private UserProfileDto toDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .department(user.getDepartment())
                .year(user.getYear())
                .trustScore(user.getTrustScore())
                .trustBadge(resolveBadge(user.getTrustScore()))
                .ridesCompleted(user.getRidesCompleted())
                .carbonCredits(user.getCarbonCredits())
                .vehicleModel(user.getVehicleModel())
                .vehicleNumber(user.getVehicleNumber())
                .bio(user.getBio())
                .preferences(user.getPreferences())
                .phoneNumber(user.getPhoneNumber())
                .phoneVerified(user.isPhoneVerified())
                .licenseVerified(user.isLicenseVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

    public static String resolveBadge(int trustScore) {
        if (trustScore >= 100) return "PLATINUM";
        if (trustScore >= 50)  return "GOLD";
        if (trustScore >= 20)  return "SILVER";
        return "BRONZE";
    }
}
