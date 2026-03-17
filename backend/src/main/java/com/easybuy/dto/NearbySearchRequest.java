package com.easybuy.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class NearbySearchRequest {
    
    @NotNull(message = "Latitude is required")
    private BigDecimal latitude;
    
    @NotNull(message = "Longitude is required")
    private BigDecimal longitude;
    
    private Double radius = 5.0; // Default 5km
    
    private String category;
    
    private String keyword;
}
