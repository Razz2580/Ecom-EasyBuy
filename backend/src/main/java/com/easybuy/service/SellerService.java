package com.easybuy.service;

import com.easybuy.dto.SellerDTO;
import com.easybuy.entity.Seller;
import com.easybuy.repository.SellerRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class SellerService {

    @Autowired
    private SellerRepository sellerRepository;

    public SellerDTO getSellerProfile(Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));
        return convertToDTO(seller);
    }

    @Transactional
    public SellerDTO updateSellerProfile(Long userId, SellerDTO request) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        seller.setStoreName(request.getStoreName());
        seller.setStoreDescription(request.getStoreDescription());
        seller.setAddress(request.getAddress());
        
        if (request.getLatitude() != null && request.getLongitude() != null) {
            seller.setLatitude(request.getLatitude());
            seller.setLongitude(request.getLongitude());
        }

        Seller updatedSeller = sellerRepository.save(seller);
        return convertToDTO(updatedSeller);
    }

    @Transactional
    public SellerDTO updateLocation(Long userId, BigDecimal latitude, BigDecimal longitude) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        seller.setLatitude(latitude);
        seller.setLongitude(longitude);

        Seller updatedSeller = sellerRepository.save(seller);
        return convertToDTO(updatedSeller);
    }

    private SellerDTO convertToDTO(Seller seller) {
        return SellerDTO.builder()
                .id(seller.getId())
                .storeName(seller.getStoreName())
                .storeDescription(seller.getStoreDescription())
                .latitude(seller.getLatitude())
                .longitude(seller.getLongitude())
                .address(seller.getAddress())
                .sellerName(seller.getUser().getFullName())
                .sellerPhone(seller.getUser().getPhone())
                .build();
    }
}
