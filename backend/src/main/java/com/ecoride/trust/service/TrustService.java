package com.ecoride.trust.service;

import com.ecoride.common.exception.ApiException;
import com.ecoride.trust.dto.TrustProfileDto;
import com.ecoride.trust.entity.TrustConnection;
import com.ecoride.trust.entity.TrustConnectionId;
import com.ecoride.trust.repository.TrustConnectionRepository;
import com.ecoride.user.entity.User;
import com.ecoride.user.repository.UserRepository;
import com.ecoride.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrustService {

    private final TrustConnectionRepository trustConnectionRepository;
    private final UserRepository userRepository;

    /**
     * Called after a ride completes — updates or creates the mutual connection row.
     * Enforces canonical ordering: user1_id < user2_id.
     */
    @Transactional
    public void recordSharedRide(UUID a, UUID b) {
        UUID lo = a.compareTo(b) < 0 ? a : b;
        UUID hi = a.compareTo(b) < 0 ? b : a;

        trustConnectionRepository.findBetween(lo, hi).ifPresentOrElse(tc -> {
            tc.setMutualRideCount(tc.getMutualRideCount() + 1);
            trustConnectionRepository.save(tc);
        }, () -> {
            TrustConnection tc = TrustConnection.builder()
                    .user1Id(lo)
                    .user2Id(hi)
                    .mutualRideCount(1)
                    .build();
            trustConnectionRepository.save(tc);
        });
    }

    @Transactional(readOnly = true)
    public TrustProfileDto getTrustProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        List<TrustConnection> connections = trustConnectionRepository.findAllForUser(userId);

        Map<UUID, String> userNames = userRepository.findAllById(
                connections.stream()
                    .map(connection -> connection.getUser1Id().equals(userId)
                        ? connection.getUser2Id()
                        : connection.getUser1Id())
                    .toList())
            .stream()
            .collect(Collectors.toMap(User::getId, User::getName));

        List<TrustProfileDto.TopConnectionDto> topConnections = connections.stream()
            .sorted((a, b) -> Integer.compare(b.getMutualRideCount(), a.getMutualRideCount()))
            .limit(4)
            .map(connection -> {
                UUID partnerId = connection.getUser1Id().equals(userId)
                    ? connection.getUser2Id()
                    : connection.getUser1Id();
                return TrustProfileDto.TopConnectionDto.builder()
                    .userId(partnerId)
                    .name(userNames.getOrDefault(partnerId, "Campus Rider"))
                    .mutualRides(connection.getMutualRideCount())
                    .build();
            })
            .toList();

        return TrustProfileDto.builder()
                .userId(user.getId())
                .name(user.getName())
                .trustScore(user.getTrustScore())
                .badge(UserService.resolveBadge(user.getTrustScore()))
                .ridesCompleted(user.getRidesCompleted())
                .uniqueRidePartners(connections.size())
            .topConnections(topConnections)
                .build();
    }
}
