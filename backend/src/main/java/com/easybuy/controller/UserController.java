package com.easybuy.controller;

import com.easybuy.entity.User;
import com.easybuy.repository.UserRepository;
import com.easybuy.security.UserDetailsImpl;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "*")
@Slf4j
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "fullName", user.getFullName(),
                "phone", user.getPhone(),
                "role", user.getRole()
        ));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetailsImpl userDetails) {
        
        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (request.containsKey("fullName")) {
            user.setFullName(request.get("fullName"));
        }
        if (request.containsKey("phone")) {
            user.setPhone(request.get("phone"));
        }
        
        User updatedUser = userRepository.save(user);
        
        return ResponseEntity.ok(Map.of(
                "id", updatedUser.getId(),
                "email", updatedUser.getEmail(),
                "fullName", updatedUser.getFullName(),
                "phone", updatedUser.getPhone(),
                "role", updatedUser.getRole()
        ));
    }
}
