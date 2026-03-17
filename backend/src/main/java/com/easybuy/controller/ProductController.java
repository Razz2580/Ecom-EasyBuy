package com.easybuy.controller;

import com.easybuy.dto.ProductDTO;
import com.easybuy.dto.ProductRequest;
import com.easybuy.security.UserDetailsImpl;
import com.easybuy.service.ProductService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
@Slf4j
public class ProductController {

    @Autowired
    private ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @GetMapping("/nearby")
    public ResponseEntity<List<ProductDTO>> getNearbyProducts(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "5.0") Double radius,
            @RequestParam(required = false) String category) {
        log.info("Fetching nearby products at lat: {}, lng: {}, radius: {}", lat, lng, radius);
        return ResponseEntity.ok(productService.getNearbyProducts(lat, lng, radius, category));
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductDTO>> searchProducts(@RequestParam String keyword) {
        return ResponseEntity.ok(productService.searchProducts(keyword));
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable String category) {
        return ResponseEntity.ok(productService.getProductsByCategory(category));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ProductDTO>> getProductsBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(productService.getProductsBySeller(sellerId));
    }

    @PostMapping("/addProduct")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDTO> createProduct(
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Creating product by seller: {}", userDetails.getId());
        return ResponseEntity.ok(productService.createProduct(request, userDetails.getId()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Updating product {} by seller: {}", id, userDetails.getId());
        return ResponseEntity.ok(productService.updateProduct(id, request, userDetails.getId()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<Void> deleteProduct(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        log.info("Deleting product {} by seller: {}", id, userDetails.getId());
        productService.deleteProduct(id, userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
