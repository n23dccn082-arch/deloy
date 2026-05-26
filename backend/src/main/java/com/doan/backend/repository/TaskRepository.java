package com.doan.backend.repository;

import com.doan.backend.entity.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    long countByStatus(String status);
    
    long countByStatusAndDeadlineBefore(String status, LocalDateTime deadline);
    
    long countByStatusAndAssigneeId(String status, String assigneeId);
    
    long countByStatusAndDeadlineBeforeAndAssigneeId(String status, LocalDateTime deadline, String assigneeId);
    
    java.util.List<Task> findByProjectId(String projectId);
}
