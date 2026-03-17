package com.easybuy.dto;

import com.easybuy.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String type;
    private Long userId;
    private String email;
    private String fullName;
    private User.UserRole role;
    private Long sellerId;
    private Long riderId;
}
