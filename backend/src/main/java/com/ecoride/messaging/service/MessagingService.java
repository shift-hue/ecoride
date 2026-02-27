package com.ecoride.messaging.service;

import com.ecoride.common.exception.ApiException;
import com.ecoride.messaging.dto.ConversationDto;
import com.ecoride.messaging.dto.MessageDto;
import com.ecoride.messaging.entity.Message;
import com.ecoride.messaging.repository.MessageRepository;
import com.ecoride.ride.repository.RideParticipantRepository;
import com.ecoride.user.entity.User;
import com.ecoride.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessagingService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final RideParticipantRepository rideParticipantRepository;

    @Transactional(readOnly = true)
    public List<ConversationDto> getConversations(String email) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        Set<UUID> contactIds = new HashSet<>();

        // Contacts from rides the user offered
        rideParticipantRepository.findByRide_Driver_Id(me.getId()).stream()
                .map(rp -> rp.getUser().getId())
                .forEach(contactIds::add);

        // Contacts from rides the user joined
        rideParticipantRepository.findByUser_IdOrderByRide_DepartureTimeAsc(me.getId()).stream()
                .map(rp -> rp.getRide().getDriver().getId())
                .forEach(contactIds::add);

        // Contacts from past message participants
        List<Message> sentOrReceived = messageRepository
                .findBySender_IdOrReceiver_IdOrderByCreatedAtDesc(me.getId(), me.getId());
        for (Message message : sentOrReceived) {
            UUID peer = message.getSender().getId().equals(me.getId())
                    ? message.getReceiver().getId()
                    : message.getSender().getId();
            contactIds.add(peer);
        }

        contactIds.remove(me.getId());

        Map<UUID, User> contactMap = userRepository.findAllById(contactIds).stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        return contactIds.stream()
                .map(peerId -> {
                    User peer = contactMap.get(peerId);
                    if (peer == null) return null;

                    Message latestForward = messageRepository
                            .findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(me.getId(), peerId)
                            .orElse(null);
                    Message latestBackward = messageRepository
                            .findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(peerId, me.getId())
                            .orElse(null);

                    Message latest;
                    if (latestForward == null) {
                        latest = latestBackward;
                    } else if (latestBackward == null) {
                        latest = latestForward;
                    } else {
                        latest = latestForward.getCreatedAt().isAfter(latestBackward.getCreatedAt())
                                ? latestForward
                                : latestBackward;
                    }

                    long unread = messageRepository.countUnread(me.getId(), peerId);

                    return ConversationDto.builder()
                            .peerId(peer.getId())
                            .peerName(peer.getName())
                            .peerDepartment(peer.getDepartment())
                            .peerYear(peer.getYear())
                            .lastMessage(latest != null ? latest.getContent() : "Say hello to start chatting")
                            .lastMessageAt(latest != null ? latest.getCreatedAt() : Instant.EPOCH)
                            .unreadCount((int) unread)
                            .build();
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(ConversationDto::getLastMessageAt).reversed())
                .toList();
    }

    @Transactional
    public List<MessageDto> getConversation(String email, UUID peerId) {
        User me = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));

        if (!userRepository.existsById(peerId)) {
            throw ApiException.notFound("Peer user not found");
        }

        messageRepository.markAsRead(me.getId(), peerId);

        return messageRepository.findConversation(me.getId(), peerId).stream()
                .map(MessageDto::from)
                .toList();
    }

    @Transactional
    public MessageDto sendMessage(String email, UUID peerId, String content) {
        User sender = userRepository.findByEmail(email)
                .orElseThrow(() -> ApiException.notFound("User not found"));
        User receiver = userRepository.findById(peerId)
                .orElseThrow(() -> ApiException.notFound("Peer user not found"));

        String trimmed = content == null ? "" : content.trim();
        if (trimmed.isBlank()) {
            throw ApiException.badRequest("Message cannot be empty");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(trimmed)
                .read(false)
                .build();

        return MessageDto.from(messageRepository.save(message));
    }
}