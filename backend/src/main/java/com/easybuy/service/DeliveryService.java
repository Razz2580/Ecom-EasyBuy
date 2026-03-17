package com.easybuy.service;

import com.easybuy.dto.DeliveryDTO;
import com.easybuy.dto.RiderDTO;
import com.easybuy.entity.Delivery;
import com.easybuy.entity.Order;
import com.easybuy.entity.Rider;
import com.easybuy.repository.DeliveryRepository;
import com.easybuy.repository.OrderRepository;
import com.easybuy.repository.RiderRepository;
import com.easybuy.util.DistanceCalculator;
import com.easybuy.websocket.WebSocketController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class DeliveryService {

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RiderRepository riderRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private WebSocketController webSocketController;

    public List<DeliveryDTO> getAvailableDeliveries(BigDecimal lat, BigDecimal lng, Double radius) {
        List<Delivery> deliveries = deliveryRepository.findByStatus(Delivery.DeliveryStatus.REQUESTED);
        
        return deliveries.stream()
                .map(this::convertToDTO)
                .filter(dto -> {
                    if (dto.getPickupLatitude() != null && dto.getPickupLongitude() != null 
                            && lat != null && lng != null) {
                        double distance = DistanceCalculator.calculateDistance(
                                lat.doubleValue(), lng.doubleValue(),
                                dto.getPickupLatitude().doubleValue(),
                                dto.getPickupLongitude().doubleValue()
                        );
                        dto.setDistance(BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP).doubleValue());
                        return distance <= radius;
                    }
                    return true;
                })
                .sorted((d1, d2) -> {
                    if (d1.getDistance() == null) return 1;
                    if (d2.getDistance() == null) return -1;
                    return d1.getDistance().compareTo(d2.getDistance());
                })
                .collect(Collectors.toList());
    }

    public List<DeliveryDTO> getRiderDeliveries(Long riderUserId) {
        Rider rider = riderRepository.findByUserId(riderUserId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));
        
        return deliveryRepository.findByRiderId(rider.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeliveryDTO acceptDelivery(Long deliveryId, Long riderUserId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        if (delivery.getStatus() != Delivery.DeliveryStatus.REQUESTED) {
            throw new RuntimeException("Delivery is not available");
        }

        Rider rider = riderRepository.findByUserId(riderUserId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        delivery.setRider(rider);
        delivery.setStatus(Delivery.DeliveryStatus.ACCEPTED);
        
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Update order status
        Order order = delivery.getOrder();
        order.setStatus(Order.OrderStatus.RIDER_ASSIGNED);
        orderRepository.save(order);

        // Notify customer
        notificationService.createNotification(
                order.getCustomer().getId(),
                "A rider has been assigned to your order",
                "RIDER_ASSIGNED",
                order.getId()
        );
        
        webSocketController.sendOrderUpdateToUser(order.getCustomer().getId(), 
                Map.of("orderId", order.getId(), "status", "RIDER_ASSIGNED", "rider", convertToRiderDTO(rider)));

        // Notify seller
        notificationService.createNotification(
                order.getProduct().getSeller().getUser().getId(),
                "A rider is coming to pick up the order",
                "RIDER_ASSIGNED",
                order.getId()
        );

        return convertToDTO(savedDelivery);
    }

    @Transactional
    public DeliveryDTO updateDeliveryStatus(Long deliveryId, Delivery.DeliveryStatus status, Long riderUserId) {
        Delivery delivery = deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        // Verify rider owns this delivery
        if (delivery.getRider() == null || !delivery.getRider().getUser().getId().equals(riderUserId)) {
            throw new RuntimeException("Not authorized to update this delivery");
        }

        delivery.setStatus(status);
        Delivery savedDelivery = deliveryRepository.save(delivery);

        Order order = delivery.getOrder();

        switch (status) {
            case AT_SELLER:
                notificationService.createNotification(
                        order.getProduct().getSeller().getUser().getId(),
                        "Rider has arrived for pickup",
                        "RIDER_AT_SELLER",
                        order.getId()
                );
                break;
                
            case PICKED_UP:
                order.setStatus(Order.OrderStatus.PICKED_UP);
                orderRepository.save(order);
                
                notificationService.createNotification(
                        order.getCustomer().getId(),
                        "Your order has been picked up and is on the way",
                        "ORDER_PICKED_UP",
                        order.getId()
                );
                
                webSocketController.sendOrderUpdateToUser(order.getCustomer().getId(),
                        Map.of("orderId", order.getId(), "status", "PICKED_UP"));
                break;
                
            case DELIVERED:
                order.setStatus(Order.OrderStatus.DELIVERED);
                orderRepository.save(order);
                
                // Process payment split
                paymentService.processPaymentSplit(order);
                
                notificationService.createNotification(
                        order.getCustomer().getId(),
                        "Your order has been delivered!",
                        "ORDER_DELIVERED",
                        order.getId()
                );
                
                notificationService.createNotification(
                        order.getProduct().getSeller().getUser().getId(),
                        "Order delivered successfully",
                        "ORDER_DELIVERED",
                        order.getId()
                );
                
                notificationService.createNotification(
                        delivery.getRider().getUser().getId(),
                        "Delivery completed! You earned commission.",
                        "DELIVERY_COMPLETED",
                        order.getId()
                );
                
                webSocketController.sendOrderUpdateToUser(order.getCustomer().getId(),
                        Map.of("orderId", order.getId(), "status", "DELIVERED"));
                break;
                
            default:
                break;
        }

        return convertToDTO(savedDelivery);
    }

    @Transactional
    public void updateRiderLocation(Long riderUserId, BigDecimal lat, BigDecimal lng) {
        Rider rider = riderRepository.findByUserId(riderUserId)
                .orElseThrow(() -> new RuntimeException("Rider not found"));

        rider.setCurrentLatitude(lat);
        rider.setCurrentLongitude(lng);
        riderRepository.save(rider);

        // Send location update to customer if rider has an active delivery
        List<Delivery> activeDeliveries = deliveryRepository.findByRiderId(rider.getId()).stream()
                .filter(d -> d.getStatus() == Delivery.DeliveryStatus.PICKED_UP)
                .collect(Collectors.toList());

        for (Delivery delivery : activeDeliveries) {
            Map<String, Object> locationUpdate = new HashMap<>();
            locationUpdate.put("deliveryId", delivery.getId());
            locationUpdate.put("orderId", delivery.getOrder().getId());
            locationUpdate.put("latitude", lat);
            locationUpdate.put("longitude", lng);
            locationUpdate.put("riderId", rider.getId());
            
            webSocketController.sendRiderLocationToCustomer(
                    delivery.getOrder().getCustomer().getId(),
                    locationUpdate
            );
        }
    }

    private DeliveryDTO convertToDTO(Delivery delivery) {
        DeliveryDTO dto = DeliveryDTO.builder()
                .id(delivery.getId())
                .orderId(delivery.getOrder().getId())
                .pickupLatitude(delivery.getPickupLatitude())
                .pickupLongitude(delivery.getPickupLongitude())
                .dropLatitude(delivery.getDropLatitude())
                .dropLongitude(delivery.getDropLongitude())
                .status(delivery.getStatus())
                .createdAt(delivery.getCreatedAt())
                .build();

        if (delivery.getRider() != null) {
            dto.setRider(convertToRiderDTO(delivery.getRider()));
        }

        return dto;
    }

    private RiderDTO convertToRiderDTO(Rider rider) {
        return RiderDTO.builder()
                .id(rider.getId())
                .vehicleType(rider.getVehicleType())
                .vehicleNumber(rider.getVehicleNumber())
                .isOnline(rider.getIsOnline())
                .currentLatitude(rider.getCurrentLatitude())
                .currentLongitude(rider.getCurrentLongitude())
                .riderName(rider.getUser().getFullName())
                .riderPhone(rider.getUser().getPhone())
                .build();
    }
}
