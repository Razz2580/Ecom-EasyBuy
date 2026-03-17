package com.easybuy.service;

import com.easybuy.dto.*;
import com.easybuy.entity.*;
import com.easybuy.entity.Order.OrderStatus;
import com.easybuy.entity.Order.DeliveryMethod;
import com.easybuy.repository.*;
import com.easybuy.util.DistanceCalculator;
import com.easybuy.websocket.WebSocketController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private DeliveryRepository deliveryRepository;

    @Autowired
    private NotificationService notificationService;

    @Autowired
    private WebSocketController webSocketController;

    private static final double DIRECT_DELIVERY_THRESHOLD_KM = 2.0;

    @Transactional
    public OrderDTO createOrder(OrderRequest request, Long customerId) {
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Check stock
        if (product.getStock() < request.getQuantity()) {
            throw new RuntimeException("Insufficient stock");
        }

        // Calculate total price
        BigDecimal totalPrice = product.getPrice()
                .multiply(BigDecimal.valueOf(request.getQuantity()));

        Order order = new Order();
        order.setCustomer(customer);
        order.setProduct(product);
        order.setQuantity(request.getQuantity());
        order.setTotalPrice(totalPrice);
        order.setStatus(OrderStatus.PENDING);
        order.setCustomerLatitude(request.getCustomerLatitude());
        order.setCustomerLongitude(request.getCustomerLongitude());
        order.setDeliveryAddress(request.getDeliveryAddress());

        Order savedOrder = orderRepository.save(order);

        // Update stock
        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        // Notify seller
        Long sellerUserId = product.getSeller().getUser().getId();
        notificationService.createNotification(
                sellerUserId,
                "New order received for " + product.getName(),
                "NEW_ORDER",
                savedOrder.getId()
        );
        
        webSocketController.sendOrderUpdateToUser(sellerUserId, convertToDTO(savedOrder));

        return convertToDTO(savedOrder);
    }

    public OrderDTO getOrderById(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return convertToDTO(order);
    }

    public List<OrderDTO> getCustomerOrders(Long customerId) {
        return orderRepository.findByCustomerId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<OrderDTO> getSellerOrders(Long sellerUserId) {
        Seller seller = sellerRepository.findByUserId(sellerUserId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return orderRepository.findBySellerId(seller.getId()).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderDTO acceptOrder(Long orderId, Long sellerUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify seller owns this product
        if (!order.getProduct().getSeller().getUser().getId().equals(sellerUserId)) {
            throw new RuntimeException("Not authorized to accept this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in pending status");
        }

        order.setStatus(OrderStatus.ACCEPTED);
        Order savedOrder = orderRepository.save(order);

        // Determine delivery method based on distance
        Seller seller = order.getProduct().getSeller();
        if (seller.getLatitude() != null && seller.getLongitude() != null 
                && order.getCustomerLatitude() != null && order.getCustomerLongitude() != null) {
            
            double distance = DistanceCalculator.calculateDistance(
                    seller.getLatitude().doubleValue(), seller.getLongitude().doubleValue(),
                    order.getCustomerLatitude().doubleValue(), order.getCustomerLongitude().doubleValue()
            );

            if (distance <= DIRECT_DELIVERY_THRESHOLD_KM) {
                order.setDeliveryMethod(DeliveryMethod.SELLER);
                order.setStatus(OrderStatus.SELLER_DELIVERING);
                orderRepository.save(order);
            }
        }

        // Notify customer
        notificationService.createNotification(
                order.getCustomer().getId(),
                "Your order for " + order.getProduct().getName() + " has been accepted",
                "ORDER_ACCEPTED",
                order.getId()
        );
        
        webSocketController.sendOrderUpdateToUser(order.getCustomer().getId(), convertToDTO(savedOrder));

        return convertToDTO(savedOrder);
    }

    @Transactional
    public OrderDTO declineOrder(Long orderId, Long sellerUserId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Verify seller owns this product
        if (!order.getProduct().getSeller().getUser().getId().equals(sellerUserId)) {
            throw new RuntimeException("Not authorized to decline this order");
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new RuntimeException("Order is not in pending status");
        }

        order.setStatus(OrderStatus.CANCELLED);
        Order savedOrder = orderRepository.save(order);

        // Restore stock
        Product product = order.getProduct();
        product.setStock(product.getStock() + order.getQuantity());
        productRepository.save(product);

        // Notify customer
        notificationService.createNotification(
                order.getCustomer().getId(),
                "Your order for " + order.getProduct().getName() + " has been declined",
                "ORDER_DECLINED",
                order.getId()
        );
        
        webSocketController.sendOrderUpdateToUser(order.getCustomer().getId(), convertToDTO(savedOrder));

        return convertToDTO(savedOrder);
    }

    @Transactional
    public OrderDTO requestRiderDelivery(Long orderId, Long customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getCustomer().getId().equals(customerId)) {
            throw new RuntimeException("Not authorized");
        }

        if (order.getStatus() != OrderStatus.ACCEPTED) {
            throw new RuntimeException("Order must be accepted first");
        }

        order.setDeliveryMethod(DeliveryMethod.RIDER);
        orderRepository.save(order);

        // Create delivery request
        Delivery delivery = new Delivery();
        delivery.setOrder(order);
        delivery.setStatus(Delivery.DeliveryStatus.REQUESTED);
        
        Seller seller = order.getProduct().getSeller();
        delivery.setPickupLatitude(seller.getLatitude());
        delivery.setPickupLongitude(seller.getLongitude());
        delivery.setDropLatitude(order.getCustomerLatitude());
        delivery.setDropLongitude(order.getCustomerLongitude());
        
        Delivery savedDelivery = deliveryRepository.save(delivery);

        // Broadcast to riders
        webSocketController.broadcastToNearbyRiders(convertToDeliveryDTO(savedDelivery));

        return convertToDTO(order);
    }

    private OrderDTO convertToDTO(Order order) {
        Seller seller = order.getProduct().getSeller();
        
        OrderDTO dto = OrderDTO.builder()
                .id(order.getId())
                .customerId(order.getCustomer().getId())
                .customerName(order.getCustomer().getFullName())
                .productId(order.getProduct().getId())
                .productName(order.getProduct().getName())
                .productImage(order.getProduct().getImageUrl())
                .quantity(order.getQuantity())
                .totalPrice(order.getTotalPrice())
                .status(order.getStatus())
                .deliveryMethod(order.getDeliveryMethod())
                .customerLatitude(order.getCustomerLatitude())
                .customerLongitude(order.getCustomerLongitude())
                .deliveryAddress(order.getDeliveryAddress())
                .seller(SellerDTO.builder()
                        .id(seller.getId())
                        .storeName(seller.getStoreName())
                        .sellerName(seller.getUser().getFullName())
                        .sellerPhone(seller.getUser().getPhone())
                        .latitude(seller.getLatitude())
                        .longitude(seller.getLongitude())
                        .address(seller.getAddress())
                        .build())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();

        if (order.getDelivery() != null && order.getDelivery().getRider() != null) {
            Rider rider = order.getDelivery().getRider();
            dto.setRider(RiderDTO.builder()
                    .id(rider.getId())
                    .vehicleType(rider.getVehicleType())
                    .vehicleNumber(rider.getVehicleNumber())
                    .riderName(rider.getUser().getFullName())
                    .riderPhone(rider.getUser().getPhone())
                    .currentLatitude(rider.getCurrentLatitude())
                    .currentLongitude(rider.getCurrentLongitude())
                    .build());
        }

        return dto;
    }

    private DeliveryDTO convertToDeliveryDTO(Delivery delivery) {
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
            Rider rider = delivery.getRider();
            dto.setRider(RiderDTO.builder()
                    .id(rider.getId())
                    .riderName(rider.getUser().getFullName())
                    .riderPhone(rider.getUser().getPhone())
                    .vehicleType(rider.getVehicleType())
                    .vehicleNumber(rider.getVehicleNumber())
                    .build());
        }

        return dto;
    }
}
