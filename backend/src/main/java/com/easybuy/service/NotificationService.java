package com.easybuy.service;

import com.easybuy.dto.NotificationDTO;
import com.easybuy.entity.Notification;
import com.easybuy.entity.User;
import com.easybuy.repository.NotificationRepository;
import com.easybuy.repository.UserRepository;
import com.easybuy.websocket.WebSocketController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WebSocketController webSocketController;

    @Transactional
    public NotificationDTO createNotification(Long userId, String message, String type, Long relatedOrderId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRelatedOrderId(relatedOrderId);
        notification.setIsRead(false);

        Notification savedNotification = notificationRepository.save(notification);
        
        NotificationDTO dto = convertToDTO(savedNotification);
        
        // Send real-time notification via WebSocket
        webSocketController.sendNotificationToUser(userId, dto);
        
        return dto;
    }

    public List<NotificationDTO> getUserNotifications(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationRepository.findByUserIdAndIsReadFalse(userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public NotificationDTO markAsRead(Long notificationId, Long userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized");
        }

        notification.setIsRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return convertToDTO(updatedNotification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalse(userId);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    private NotificationDTO convertToDTO(Notification notification) {
        return NotificationDTO.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .isRead(notification.getIsRead())
                .relatedOrderId(notification.getRelatedOrderId())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
