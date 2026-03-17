package com.easybuy.service;

import com.easybuy.dto.RiderDTO;
import com.easybuy.entity.Rider;
import com.easybuy.repository.RiderRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@Slf4j
public class RiderService {

    @Autowired
    private RiderRepository riderRepository;

    public RiderDTO getRiderProfile(Long userId) {
        Rider rider = riderRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Rider profile not found"));
        return convertToDTO(rider);
    }

    @Transactional
    public RiderDTO updateRiderProfile(Long userId, RiderDTO request) {
        Rider rider = riderRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Rider profile not found"));

        rider.setVehicleType(request.getVehicleType());
        rider.setVehicleNumber(request.getVehicleNumber());

        Rider updatedRider = riderRepository.save(rider);
        return convertToDTO(updatedRider);
    }

    @Transactional
    public RiderDTO toggleOnlineStatus(Long userId, Boolean isOnline) {
        Rider rider = riderRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Rider profile not found"));

        rider.setIsOnline(isOnline);
        Rider updatedRider = riderRepository.save(rider);
        return convertToDTO(updatedRider);
    }

    @Transactional
    public RiderDTO updateLocation(Long userId, BigDecimal latitude, BigDecimal longitude) {
        Rider rider = riderRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Rider profile not found"));

        rider.setCurrentLatitude(latitude);
        rider.setCurrentLongitude(longitude);

        Rider updatedRider = riderRepository.save(rider);
        return convertToDTO(updatedRider);
    }

    private RiderDTO convertToDTO(Rider rider) {
        return RiderDTO.builder()
                .id(rider.getId())
                .vehicleType(rider.getVehicleType())
                .vehicleNumber(rider.getVehicleNumber())
                .isOnline(rider.getIsOnline())
                .currentLatitude(rider.getCurrentLatitude())
                .currentLongitude(rider.getCurrentLongitude())
                .riderName(rider.getUser().getFullName())
                .riderPhone(rider.getUser().getPhone())
                .build();
    }
}
