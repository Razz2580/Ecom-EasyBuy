package com.easybuy.controller;

import com.easybuy.dto.NotificationDTO;
import com.easybuy.security.UserDetailsImpl;
import com.easybuy.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public ResponseEntity<List<NotificationDTO>> getUserNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getId()));
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userDetails.getId()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        long count = notificationService.getUnreadCount(userDetails.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(notificationService.markAsRead(id, userDetails.getId()));
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        notificationService.markAllAsRead(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
