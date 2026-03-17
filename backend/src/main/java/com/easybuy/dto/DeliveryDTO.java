package com.easybuy.dto;

import com.easybuy.entity.Delivery;
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
public class DeliveryDTO {
    private Long id;
    private Long orderId;
    private RiderDTO rider;
    private BigDecimal pickupLatitude;
    private BigDecimal pickupLongitude;
    private BigDecimal dropLatitude;
    private BigDecimal dropLongitude;
    private Delivery.DeliveryStatus status;
    private Double distance;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}