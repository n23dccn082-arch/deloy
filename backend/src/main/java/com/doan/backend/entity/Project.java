package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "projects")
public class Project {
    
    @Id
    private String id;
    
    private String name;
    
    private String description;
    
    @Field("createdById")
    private String createdById;
    
    private String priority;
    
    private LocalDateTime deadline;
    
    private Long budget;
    
    @Field("createdAt")
    private LocalDateTime createdAt;
    
    @Field("updatedAt")
    private LocalDateTime updatedAt;
}
