package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "tasks")
public class Task {
    
    @Id
    private String id;
    
    private String title;
    
    private String description;
    
    private String status;
    
    private String priority;
    
    private LocalDateTime deadline;
    
    @Field("progress")
    private Integer progress;
    
    @Field("projectId")
    private String projectId;
    
    @Field("assigneeId")
    private String assigneeId;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
