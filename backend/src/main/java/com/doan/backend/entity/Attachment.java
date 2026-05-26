package com.doan.backend.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "attachments")
public class Attachment {
    @Id
    private String id;
    private String filename;
    private String url;
    
    @Field("taskId")
    private String taskId;
    
    @Field("userId")
    private String userId;
    
    @Field("uploadedAt")
    private LocalDateTime uploadedAt;
}
