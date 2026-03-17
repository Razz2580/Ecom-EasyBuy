package com.easybuy.controller;

import com.easybuy.dto.OrderDTO;
import com.easybuy.dto.OrderRequest;
import com.easybuy.security.UserDetailsImpl;
import com.easybuy.service.OrderService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
@Slf4j
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/{id}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    @GetMapping("/my-orders")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderDTO>> getCustomerOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getCustomerOrders(userDetails.getId()));
    }

    @GetMapping("/seller-orders")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<List<OrderDTO>> getSellerOrders(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(orderService.getSellerOrders(userDetails.getId()));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> createOrder(
            @Valid @RequestBody OrderRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Creating order by customer: {}", userDetails.getId());
        return ResponseEntity.ok(orderService.createOrder(request, userDetails.getId()));
    }

    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<OrderDTO> acceptOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Accepting order {} by seller: {}", id, userDetails.getId());
        return ResponseEntity.ok(orderService.acceptOrder(id, userDetails.getId()));
    }

    @PutMapping("/{id}/decline")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<OrderDTO> declineOrder(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Declining order {} by seller: {}", id, userDetails.getId());
        return ResponseEntity.ok(orderService.declineOrder(id, userDetails.getId()));
    }

    @PostMapping("/{id}/request-rider")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<OrderDTO> requestRiderDelivery(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Requesting rider delivery for order {} by customer: {}", id, userDetails.getId());
        return ResponseEntity.ok(orderService.requestRiderDelivery(id, userDetails.getId()));
    }
}
