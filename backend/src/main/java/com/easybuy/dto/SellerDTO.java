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
public class SellerDTO {
    private Long id;
    private String storeName;
    private String storeDescription;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String address;
    private String sellerName;
    private String sellerPhone;
}
