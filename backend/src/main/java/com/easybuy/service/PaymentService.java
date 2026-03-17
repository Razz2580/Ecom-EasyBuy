package com.easybuy.service;

import com.easybuy.dto.PaymentRequest;
import com.easybuy.dto.PaymentResponse;
import com.easybuy.entity.Order;
import com.easybuy.entity.Payment;
import com.easybuy.repository.OrderRepository;
import com.easybuy.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class PaymentService {

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${stripe.publishable.key}")
    private String stripePublishableKey;

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private OrderRepository orderRepository;

    private static final BigDecimal RIDER_COMMISSION_PERCENTAGE = new BigDecimal("0.10");

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public PaymentResponse createPaymentIntent(PaymentRequest request) throws StripeException {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // Calculate amounts
        BigDecimal totalAmount = order.getTotalPrice();
        BigDecimal riderAmount = totalAmount.multiply(RIDER_COMMISSION_PERCENTAGE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal sellerAmount = totalAmount.subtract(riderAmount).setScale(2, RoundingMode.HALF_UP);

        // Create Stripe PaymentIntent
        PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                .setAmount(totalAmount.multiply(BigDecimal.valueOf(100)).longValue()) // Convert to cents
                .setCurrency("usd")
                .setAutomaticPaymentMethods(
                        PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                                .setEnabled(true)
                                .build()
                )
                .putMetadata("order_id", order.getId().toString())
                .putMetadata("customer_id", order.getCustomer().getId().toString())
                .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Create payment record
        Payment payment = new Payment();
        payment.setOrder(order);
        payment.setAmount(totalAmount);
        payment.setSellerAmount(sellerAmount);
        payment.setRiderAmount(riderAmount);
        payment.setStatus(Payment.PaymentStatus.PENDING);
        payment.setPaymentIntentId(paymentIntent.getId());

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .clientSecret(paymentIntent.getClientSecret())
                .paymentIntentId(paymentIntent.getId())
                .amount(totalAmount)
                .status(paymentIntent.getStatus())
                .publishableKey(stripePublishableKey)
                .build();
    }

    @Transactional
    public Payment confirmPayment(String paymentIntentId) throws StripeException {
        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);
        
        Payment payment = paymentRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if ("succeeded".equals(paymentIntent.getStatus())) {
            payment.setStatus(Payment.PaymentStatus.SUCCESS);
        } else {
            payment.setStatus(Payment.PaymentStatus.FAILED);
        }

        return paymentRepository.save(payment);
    }

    @Transactional
    public void processPaymentSplit(Order order) {
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getStatus() != Payment.PaymentStatus.SUCCESS) {
            throw new RuntimeException("Payment not successful");
        }

        // In a real implementation, you would use Stripe Connect to transfer funds
        // to the seller and rider accounts. For now, we just log the split.
        log.info("Processing payment split for order {}: Seller gets {}, Rider gets {}",
                order.getId(), payment.getSellerAmount(), payment.getRiderAmount());

        // TODO: Implement actual Stripe Connect transfers
        // transferToSeller(order.getProduct().getSeller(), payment.getSellerAmount());
        // if (order.getDelivery() != null && order.getDelivery().getRider() != null) {
        //     transferToRider(order.getDelivery().getRider(), payment.getRiderAmount());
        // }
    }

    public PaymentResponse getPaymentStatus(Long orderId) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        return PaymentResponse.builder()
                .paymentIntentId(payment.getPaymentIntentId())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .build();
    }
}
