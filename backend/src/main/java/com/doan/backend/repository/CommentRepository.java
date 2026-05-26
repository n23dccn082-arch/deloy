package com.doan.backend.repository;

import com.doan.backend.entity.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    java.util.List<Comment> findByTaskId(String taskId);
}
