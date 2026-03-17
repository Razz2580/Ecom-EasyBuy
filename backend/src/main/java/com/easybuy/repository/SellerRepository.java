package com.easybuy.repository;

import com.easybuy.entity.Seller;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SellerRepository extends JpaRepository<Seller, Long> {
    Optional<Seller> findByUserId(Long userId);
    
    @Query(value = "SELECT s.* FROM sellers s WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * " +
           "cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude)))) <= :radius",
           nativeQuery = true)
    List<Seller> findNearbySellers(@Param("lat") BigDecimal lat, 
                                    @Param("lng") BigDecimal lng, 
                                    @Param("radius") Double radius);
}
