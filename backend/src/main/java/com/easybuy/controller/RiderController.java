package com.easybuy.controller;

import com.easybuy.dto.DeliveryDTO;
import com.easybuy.dto.LocationUpdateRequest;
import com.easybuy.dto.RiderDTO;
import com.easybuy.entity.Delivery;
import com.easybuy.security.UserDetailsImpl;
import com.easybuy.service.DeliveryService;
import com.easybuy.service.RiderService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/rider")
@CrossOrigin(origins = "*")
@Slf4j
public class RiderController {

    @Autowired
    private RiderService riderService;

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RiderDTO> getRiderProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(riderService.getRiderProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RiderDTO> updateRiderProfile(
            @Valid @RequestBody RiderDTO request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Updating rider profile for user: {}", userDetails.getId());
        return ResponseEntity.ok(riderService.updateRiderProfile(userDetails.getId(), request));
    }

    @PutMapping("/online-status")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RiderDTO> toggleOnlineStatus(
            @RequestParam Boolean isOnline,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Setting rider {} online status to: {}", userDetails.getId(), isOnline);
        return ResponseEntity.ok(riderService.toggleOnlineStatus(userDetails.getId(), isOnline));
    }

    @PutMapping("/location")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<RiderDTO> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Updating rider location for user: {}", userDetails.getId());
        
        // Update in rider service
        RiderDTO rider = riderService.updateLocation(
                userDetails.getId(), request.getLatitude(), request.getLongitude());
        
        // Also update in delivery service for real-time tracking
        deliveryService.updateRiderLocation(userDetails.getId(), 
                request.getLatitude(), request.getLongitude());
        
        return ResponseEntity.ok(rider);
    }

    @GetMapping("/available-deliveries")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<List<DeliveryDTO>> getAvailableDeliveries(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10.0") Double radius) {
        return ResponseEntity.ok(deliveryService.getAvailableDeliveries(lat, lng, radius));
    }

    @GetMapping("/my-deliveries")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<List<DeliveryDTO>> getRiderDeliveries(
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(deliveryService.getRiderDeliveries(userDetails.getId()));
    }

    @PostMapping("/deliveries/{deliveryId}/accept")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<DeliveryDTO> acceptDelivery(
            @PathVariable Long deliveryId,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Rider {} accepting delivery {}", userDetails.getId(), deliveryId);
        return ResponseEntity.ok(deliveryService.acceptDelivery(deliveryId, userDetails.getId()));
    }

    @PutMapping("/deliveries/{deliveryId}/status")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<DeliveryDTO> updateDeliveryStatus(
            @PathVariable Long deliveryId,
            @RequestParam Delivery.DeliveryStatus status,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Rider {} updating delivery {} status to {}", userDetails.getId(), deliveryId, status);
        return ResponseEntity.ok(deliveryService.updateDeliveryStatus(deliveryId, status, userDetails.getId()));
    }
}
