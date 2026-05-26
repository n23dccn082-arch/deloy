package com.doan.backend.repository;

import com.doan.backend.entity.Project;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.mongodb.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface ProjectRepository extends MongoRepository<Project, String> {

    // Note: Since ProjectMember is a separate document in MongoDB, a simple JOIN query doesn't work.
    // For now, this will just count total projects to prevent errors, or we should handle it in service layer.
    // Assuming the user created the project:
    @Query("{ 'createdById': ?0 }")
    long countProjectsByUserId(String userId);
}
