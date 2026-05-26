package com.doan.backend.repository;

import com.doan.backend.entity.ProjectMember;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface ProjectMemberRepository extends MongoRepository<ProjectMember, String> {
    List<ProjectMember> findByProjectId(String projectId);
    List<ProjectMember> findByUserId(String userId);
    boolean existsByProjectIdAndUserId(String projectId, String userId);
}
