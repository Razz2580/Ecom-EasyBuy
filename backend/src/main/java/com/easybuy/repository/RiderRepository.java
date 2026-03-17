package com.easybuy.repository;

import com.easybuy.entity.Rider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface RiderRepository extends JpaRepository<Rider, Long> {
    Optional<Rider> findByUserId(Long userId);
    
    List<Rider> findByIsOnlineTrue();
    
    @Query(value = "SELECT r.* FROM riders r WHERE r.is_online = true AND " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(r.current_latitude)) * " +
           "cos(radians(r.current_longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(r.current_latitude)))) <= :radius",
           nativeQuery = true)
    List<Rider> findNearbyOnlineRiders(@Param("lat") BigDecimal lat, 
                                        @Param("lng") BigDecimal lng, 
                                        @Param("radius") Double radius);
}
