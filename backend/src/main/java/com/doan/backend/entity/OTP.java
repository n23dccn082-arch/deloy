package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "otps")
public class OTP {
    @Id
    private String id;
    private String email;
    private String code;
    private String type;
    
    @Field("expiresAt")
    private LocalDateTime expiresAt;
    
    private Boolean used;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
}
