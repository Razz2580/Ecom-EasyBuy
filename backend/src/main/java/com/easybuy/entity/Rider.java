package com.easybuy.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "riders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rider {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;
    
    @Column(name = "vehicle_type", length = 50)
    private String vehicleType;
    
    @Column(name = "vehicle_number", length = 50)
    private String vehicleNumber;
    
    @Column(name = "is_online")
    private Boolean isOnline = false;
    
    @Column(name = "current_latitude", precision = 10, scale = 8)
    private BigDecimal currentLatitude;
    
    @Column(name = "current_longitude", precision = 11, scale = 8)
    private BigDecimal currentLongitude;
}
