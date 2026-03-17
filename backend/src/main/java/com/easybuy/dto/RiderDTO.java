package com.easybuy.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiderDTO {
    private Long id;
    private String vehicleType;
    private String vehicleNumber;
    private Boolean isOnline;
    private BigDecimal currentLatitude;
    private BigDecimal currentLongitude;
    private String riderName;
    private String riderPhone;
    private Double distance;
}
