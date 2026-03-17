package com.easybuy.repository;

import com.easybuy.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    List<Order> findByCustomerId(Long customerId);
    
    @Query("SELECT o FROM Order o WHERE o.product.seller.id = :sellerId")
    List<Order> findBySellerId(@Param("sellerId") Long sellerId);
    
    @Query("SELECT o FROM Order o WHERE o.delivery.rider.id = :riderId")
    List<Order> findByRiderId(@Param("riderId") Long riderId);
    
    List<Order> findByStatus(Order.OrderStatus status);
}
