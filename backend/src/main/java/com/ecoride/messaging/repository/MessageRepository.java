package com.ecoride.messaging.repository;

import com.ecoride.messaging.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {

        List<Message> findBySender_IdOrReceiver_IdOrderByCreatedAtDesc(UUID senderId, UUID receiverId);

    @Query("""
            SELECT m FROM Message m
            WHERE (m.sender.id = :a AND m.receiver.id = :b)
               OR (m.sender.id = :b AND m.receiver.id = :a)
            ORDER BY m.createdAt ASC
            """)
    List<Message> findConversation(@Param("a") UUID userA, @Param("b") UUID userB);

    @Query("""
            SELECT m FROM Message m
            WHERE (m.sender.id = :a AND m.receiver.id = :b)
               OR (m.sender.id = :b AND m.receiver.id = :a)
            ORDER BY m.createdAt DESC
            """)
    List<Message> findConversationDesc(@Param("a") UUID userA, @Param("b") UUID userB);

    @Query("""
            SELECT COUNT(m) FROM Message m
            WHERE m.sender.id = :peerId
              AND m.receiver.id = :meId
              AND m.read = false
            """)
    long countUnread(@Param("meId") UUID meId, @Param("peerId") UUID peerId);

    @Modifying
    @Query("""
            UPDATE Message m
            SET m.read = true
            WHERE m.sender.id = :peerId
              AND m.receiver.id = :meId
              AND m.read = false
            """)
    int markAsRead(@Param("meId") UUID meId, @Param("peerId") UUID peerId);

    Optional<Message> findTopBySender_IdAndReceiver_IdOrderByCreatedAtDesc(UUID senderId, UUID receiverId);
}