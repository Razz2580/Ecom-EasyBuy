package com.easybuy.dto;

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
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private String category;
    private String imageUrl;
    private Integer stock;
    private Long sellerId;
    private String sellerName;
    private String storeName;
    private BigDecimal sellerLatitude;
    private BigDecimal sellerLongitude;
    private Double distance;
    private LocalDateTime createdAt;
}
