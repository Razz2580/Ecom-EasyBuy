package com.easybuy.controller;

import com.easybuy.dto.DeliveryDTO;
import com.easybuy.service.DeliveryService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/deliveries")
@CrossOrigin(origins = "*")
@Slf4j
public class DeliveryController {

    @Autowired
    private DeliveryService deliveryService;

    @GetMapping("/nearby")
    @PreAuthorize("hasRole('RIDER')")
    public ResponseEntity<List<DeliveryDTO>> getNearbyDeliveries(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "10.0") Double radius) {
        return ResponseEntity.ok(deliveryService.getAvailableDeliveries(lat, lng, radius));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DeliveryDTO> getDeliveryById(@PathVariable Long id) {
        // Implementation needed in service
        return ResponseEntity.ok().build();
    }
}
