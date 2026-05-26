package com.doan.backend.repository;

import com.doan.backend.entity.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends MongoRepository<User, String> {
    java.util.Optional<User> findByEmail(String email);
}
