package com.doan.backend.controller;

import com.doan.backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Tạm thời mở CORS để test với React
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private com.doan.backend.repository.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        if (email == null || password == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }

        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty() || !userOpt.get().getPassword().equals(password)) {
            return ResponseEntity.status(401).body(Map.of("error", "Email hoặc mật khẩu không chính xác"));
        }

        com.doan.backend.entity.User user = userOpt.get();
        // Return user info and fake token for now
        return ResponseEntity.ok(Map.of(
            "message", "Đăng nhập thành công",
            "token", "real-jwt-token-" + user.getId(),
            "user", Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole(),
                "avatar", user.getAvatar() != null ? user.getAvatar() : ""
            )
        ));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        if (email == null || email.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email không được để trống"));
        }

        try {
            otpService.generateAndSendOtp(email);
            return ResponseEntity.ok(Map.of("message", "Mã OTP đã được gửi đến email của bạn"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Lỗi gửi email: " + e.getMessage()));
        }
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        
        if (email == null || otp == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin"));
        }

        boolean isValid = otpService.verifyOtp(email, otp);
        if (isValid) {
            return ResponseEntity.ok(Map.of("message", "Xác thực thành công", "token", "fake-jwt-token-for-reset"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("error", "Mã OTP không chính xác hoặc đã hết hạn"));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String newPassword = request.get("newPassword");
        
        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Thiếu thông tin email hoặc mật khẩu mới"));
        }
        
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "Không tìm thấy người dùng với email này"));
        }
        
        com.doan.backend.entity.User user = userOpt.get();
        user.setPassword(newPassword);
        user.setUpdatedAt(java.time.LocalDateTime.now());
        userRepository.save(user);
        
        return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
    }
}
