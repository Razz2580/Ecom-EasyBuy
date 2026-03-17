package com.easybuy.dto;

import com.easybuy.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "Full name is required")
    private String fullName;
    
    private String phone;
    
    @NotNull(message = "Role is required")
    private User.UserRole role;
    
    // Seller specific fields
    private String storeName;
    private String storeDescription;
    private String address;
    
    // Rider specific fields
    private String vehicleType;
    private String vehicleNumber;
}
