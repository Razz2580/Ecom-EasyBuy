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
public class PaymentResponse {
    private String clientSecret;
    private String paymentIntentId;
    private BigDecimal amount;
    private String status;
    private String publishableKey;
}
