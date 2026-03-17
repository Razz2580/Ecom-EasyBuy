package com.easybuy.dto;

import com.easybuy.entity.Order;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private BigDecimal totalPrice;
    private Order.OrderStatus status;
    private Order.DeliveryMethod deliveryMethod;
    private BigDecimal customerLatitude;
    private BigDecimal customerLongitude;
    private String deliveryAddress;
    private SellerDTO seller;
    private RiderDTO rider;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
