package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "project_members")
public class ProjectMember {
    @Id
    private String id;
    
    @Field("projectId")
    private String projectId;
    
    @Field("userId")
    private String userId;
    
    private String role;
    
    @Field("joinedAt")
    private LocalDateTime joinedAt;
}
