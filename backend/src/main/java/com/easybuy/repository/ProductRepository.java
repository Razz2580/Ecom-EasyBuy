package com.easybuy.repository;

import com.easybuy.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findBySellerId(Long sellerId);
    
    List<Product> findByCategory(String category);
    
    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);
    
    @Query(value = "SELECT p.* FROM products p JOIN sellers s ON p.seller_id = s.id WHERE " +
           "(6371 * acos(cos(radians(:lat)) * cos(radians(s.latitude)) * " +
           "cos(radians(s.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(s.latitude)))) <= :radius " +
           "AND (:category IS NULL OR p.category = :category)",
           nativeQuery = true)
    List<Product> findNearbyProducts(@Param("lat") BigDecimal lat, 
                                      @Param("lng") BigDecimal lng, 
                                      @Param("radius") Double radius,
                                      @Param("category") String category);
}
