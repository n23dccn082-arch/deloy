package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "comments")
public class Comment {
    @Id
    private String id;
    private String content;
    
    @Field("taskId")
    private String taskId;
    
    @Field("userId")
    private String userId;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
}
