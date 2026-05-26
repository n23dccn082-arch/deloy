package com.doan.backend.controller;

import com.doan.backend.entity.User;
import com.doan.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        if (user.getEmail() == null || user.getPassword() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email and password are required"));
        }
        
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
        }
        
        if (user.getRole() == null || user.getRole().isEmpty()) {
            user.setRole("MEMBER");
        }
        
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    @PatchMapping("/{id}/role")
    public ResponseEntity<?> updateRole(@PathVariable String id, @RequestBody Map<String, String> payload) {
        var userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();
        user.setRole(payload.get("role"));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(Map.of("message", "Role updated"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        if (!userRepository.existsById(id)) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }
        userRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, String> payload) {
        var userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();
        User user = userOpt.get();
        if (payload.containsKey("name")) user.setName(payload.get("name"));
        if (payload.containsKey("avatar")) user.setAvatar(payload.get("avatar"));
        if (payload.containsKey("email")) {
            String newEmail = payload.get("email");
            if (!newEmail.equals(user.getEmail()) && userRepository.findByEmail(newEmail).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is already in use"));
            }
            user.setEmail(newEmail);
        }
        if (payload.containsKey("password")) {
            user.setPassword(payload.get("password"));
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return ResponseEntity.ok(user);
    }
}
