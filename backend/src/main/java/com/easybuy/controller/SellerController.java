package com.easybuy.controller;

import com.easybuy.dto.LocationUpdateRequest;
import com.easybuy.dto.SellerDTO;
import com.easybuy.security.UserDetailsImpl;
import com.easybuy.service.SellerService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin(origins = "*")
@Slf4j
public class SellerController {

    @Autowired
    private SellerService sellerService;

    @GetMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerDTO> getSellerProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(sellerService.getSellerProfile(userDetails.getId()));
    }

    @PutMapping("/profile")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerDTO> updateSellerProfile(
            @Valid @RequestBody SellerDTO request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Updating seller profile for user: {}", userDetails.getId());
        return ResponseEntity.ok(sellerService.updateSellerProfile(userDetails.getId(), request));
    }

    @PutMapping("/location")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<SellerDTO> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Updating seller location for user: {}", userDetails.getId());
        return ResponseEntity.ok(sellerService.updateLocation(
                userDetails.getId(), request.getLatitude(), request.getLongitude()));
    }
}
