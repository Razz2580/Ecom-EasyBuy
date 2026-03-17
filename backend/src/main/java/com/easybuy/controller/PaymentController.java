package com.easybuy.controller;

import com.easybuy.dto.PaymentRequest;
import com.easybuy.dto.PaymentResponse;
import com.easybuy.service.PaymentService;
import com.stripe.exception.StripeException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
@Slf4j
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @PostMapping("/create-intent")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        try {
            log.info("Creating payment intent for order: {}", request.getOrderId());
            return ResponseEntity.ok(paymentService.createPaymentIntent(request));
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new RuntimeException("Payment processing failed: " + e.getMessage());
        }
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@RequestBody Map<String, String> request) {
        try {
            String paymentIntentId = request.get("paymentIntentId");
            log.info("Confirming payment: {}", paymentIntentId);
            paymentService.confirmPayment(paymentIntentId);
            return ResponseEntity.ok(Map.of("status", "success"));
        } catch (StripeException e) {
            log.error("Stripe error: {}", e.getMessage());
            throw new RuntimeException("Payment confirmation failed: " + e.getMessage());
        }
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> getPaymentStatus(@PathVariable Long orderId) {
        return ResponseEntity.ok(paymentService.getPaymentStatus(orderId));
    }

    @PostMapping("/webhook")
    public ResponseEntity<?> handleWebhook(@RequestBody String payload, 
                                          @RequestHeader("Stripe-Signature") String sigHeader) {
        // Handle Stripe webhooks for payment status updates
        log.info("Received Stripe webhook");
        return ResponseEntity.ok().build();
    }
}
