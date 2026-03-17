package com.easybuy.websocket;

import com.easybuy.dto.NotificationDTO;
import com.easybuy.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.security.Principal;
import java.util.Map;

@Controller
@Slf4j
public class WebSocketController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/location/update")
    public void updateLocation(@Payload Map<String, Object> payload, Principal principal) {
        if (principal != null) {
            log.info("Location update from {}: {}", principal.getName(), payload);
        }
    }

    @MessageMapping("/rider/location")
    @SendToUser("/queue/rider-location")
    public Map<String, Object> receiveRiderLocation(@Payload Map<String, Object> payload, Principal principal) {
        log.info("Rider location update: {}", payload);
        return payload;
    }

    public void sendNotificationToUser(Long userId, NotificationDTO notification) {
        log.info("Sending notification to user {}: {}", userId, notification);
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/notifications",
                notification
        );
    }

    public void sendOrderUpdateToUser(Long userId, Object orderUpdate) {
        log.info("Sending order update to user {}: {}", userId, orderUpdate);
        messagingTemplate.convertAndSendToUser(
                userId.toString(),
                "/queue/orders",
                orderUpdate
        );
    }

    public void sendDeliveryRequestToRider(Long riderId, Object deliveryRequest) {
        log.info("Sending delivery request to rider {}: {}", riderId, deliveryRequest);
        messagingTemplate.convertAndSendToUser(
                riderId.toString(),
                "/queue/delivery-requests",
                deliveryRequest
        );
    }

    public void sendRiderLocationToCustomer(Long customerId, Map<String, Object> location) {
        log.info("Sending rider location to customer {}: {}", customerId, location);
        messagingTemplate.convertAndSendToUser(
                customerId.toString(),
                "/queue/rider-location",
                location
        );
    }

    public void broadcastToNearbyRiders(Object deliveryRequest) {
        log.info("Broadcasting delivery request to all online riders");
        messagingTemplate.convertAndSend("/topic/delivery-requests", deliveryRequest);
    }
}
