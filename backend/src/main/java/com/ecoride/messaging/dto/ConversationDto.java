package com.ecoride.messaging.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ConversationDto {
    private UUID peerId;
    private String peerName;
    private String peerDepartment;
    private Integer peerYear;
    private String lastMessage;
    private Instant lastMessageAt;
    private int unreadCount;
}