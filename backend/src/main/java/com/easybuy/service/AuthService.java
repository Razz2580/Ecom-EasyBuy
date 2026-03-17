package com.easybuy.service;

import com.easybuy.dto.*;
import com.easybuy.entity.*;
import com.easybuy.repository.*;
import com.easybuy.security.JwtUtils;
import com.easybuy.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SellerRepository sellerRepository;

    @Autowired
    private RiderRepository riderRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);

        // Create seller or rider profile if applicable
        Long sellerId = null;
        Long riderId = null;

        if (request.getRole() == User.UserRole.SELLER) {
            Seller seller = new Seller();
            seller.setUser(savedUser);
            seller.setStoreName(request.getStoreName());
            seller.setStoreDescription(request.getStoreDescription());
            seller.setAddress(request.getAddress());
            Seller savedSeller = sellerRepository.save(seller);
            sellerId = savedSeller.getId();
        } else if (request.getRole() == User.UserRole.RIDER) {
            Rider rider = new Rider();
            rider.setUser(savedUser);
            rider.setVehicleType(request.getVehicleType());
            rider.setVehicleNumber(request.getVehicleNumber());
            rider.setIsOnline(false);
            Rider savedRider = riderRepository.save(rider);
            riderId = savedRider.getId();
        }

        // Generate JWT token
        String jwt = jwtUtils.generateTokenFromUsername(
                savedUser.getEmail(),
                savedUser.getId(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole())
                .sellerId(sellerId)
                .riderId(riderId)
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        
        // Get seller or rider ID if applicable
        Long sellerId = null;
        Long riderId = null;
        
        if (userDetails.getRole() == User.UserRole.SELLER) {
            sellerId = sellerRepository.findByUserId(userDetails.getId())
                    .map(Seller::getId)
                    .orElse(null);
        } else if (userDetails.getRole() == User.UserRole.RIDER) {
            riderId = riderRepository.findByUserId(userDetails.getId())
                    .map(Rider::getId)
                    .orElse(null);
        }

        return AuthResponse.builder()
                .token(jwt)
                .type("Bearer")
                .userId(userDetails.getId())
                .email(userDetails.getUsername())
                .fullName(userDetails.getFullName())
                .role(userDetails.getRole())
                .sellerId(sellerId)
                .riderId(riderId)
                .build();
    }
}
