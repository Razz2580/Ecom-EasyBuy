package com.easybuy.service;

import com.easybuy.dto.ProductDTO;
import com.easybuy.dto.ProductRequest;
import com.easybuy.entity.Product;
import com.easybuy.entity.Seller;
import com.easybuy.entity.User;
import com.easybuy.repository.ProductRepository;
import com.easybuy.repository.SellerRepository;
import com.easybuy.util.DistanceCalculator;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private SellerRepository sellerRepository;

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        return convertToDTO(product);
    }

    public List<ProductDTO> getProductsBySeller(Long sellerId) {
        return productRepository.findBySellerId(sellerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> searchProducts(String keyword) {
        return productRepository.searchByKeyword(keyword).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getNearbyProducts(BigDecimal lat, BigDecimal lng, Double radius, String category) {
        List<Product> products = productRepository.findNearbyProducts(lat, lng, radius, category);
        
        return products.stream()
                .map(product -> {
                    ProductDTO dto = convertToDTO(product);
                    // Calculate distance
                    if (product.getSeller().getLatitude() != null && product.getSeller().getLongitude() != null) {
                        double distance = DistanceCalculator.calculateDistance(
                                lat.doubleValue(), lng.doubleValue(),
                                product.getSeller().getLatitude().doubleValue(),
                                product.getSeller().getLongitude().doubleValue()
                        );
                        dto.setDistance(BigDecimal.valueOf(distance).setScale(2, RoundingMode.HALF_UP).doubleValue());
                    }
                    return dto;
                })
                .sorted((p1, p2) -> {
                    if (p1.getDistance() == null) return 1;
                    if (p2.getDistance() == null) return -1;
                    return p1.getDistance().compareTo(p2.getDistance());
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public ProductDTO createProduct(ProductRequest request, Long userId) {
        Seller seller = sellerRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Seller profile not found"));

        Product product = new Product();
        product.setSeller(seller);
        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setStock(request.getStock());

        Product savedProduct = productRepository.save(product);
        return convertToDTO(savedProduct);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductRequest request, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Verify ownership
        if (!product.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to update this product");
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setCategory(request.getCategory());
        product.setImageUrl(request.getImageUrl());
        product.setStock(request.getStock());

        Product updatedProduct = productRepository.save(product);
        return convertToDTO(updatedProduct);
    }

    @Transactional
    public void deleteProduct(Long id, Long userId) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // Verify ownership
        if (!product.getSeller().getUser().getId().equals(userId)) {
            throw new RuntimeException("Not authorized to delete this product");
        }

        productRepository.delete(product);
    }

    private ProductDTO convertToDTO(Product product) {
        Seller seller = product.getSeller();
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .stock(product.getStock())
                .sellerId(seller.getId())
                .sellerName(seller.getUser().getFullName())
                .storeName(seller.getStoreName())
                .sellerLatitude(seller.getLatitude())
                .sellerLongitude(seller.getLongitude())
                .createdAt(product.getCreatedAt())
                .build();
    }
}
