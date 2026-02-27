package com.ecoride.messaging.controller;

import com.ecoride.common.response.ApiResponse;
import com.ecoride.messaging.dto.ConversationDto;
import com.ecoride.messaging.dto.MessageDto;
import com.ecoride.messaging.dto.SendMessageRequest;
import com.ecoride.messaging.service.MessagingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessagingController {

    private final MessagingService messagingService;

    @GetMapping("/conversations")
    public ApiResponse<List<ConversationDto>> getConversations(@AuthenticationPrincipal UserDetails principal) {
        return ApiResponse.ok(messagingService.getConversations(principal.getUsername()));
    }

    @GetMapping("/{peerId:[0-9a-fA-F\\-]{36}}")
    public ApiResponse<List<MessageDto>> getConversation(@AuthenticationPrincipal UserDetails principal,
                                                         @PathVariable UUID peerId) {
        return ApiResponse.ok(messagingService.getConversation(principal.getUsername(), peerId));
    }

    @PostMapping("/{peerId:[0-9a-fA-F\\-]{36}}")
    public ApiResponse<MessageDto> send(@AuthenticationPrincipal UserDetails principal,
                                        @PathVariable UUID peerId,
                                        @Valid @RequestBody SendMessageRequest request) {
        return ApiResponse.ok("Message sent", messagingService.sendMessage(principal.getUsername(), peerId, request.getContent()));
    }
}