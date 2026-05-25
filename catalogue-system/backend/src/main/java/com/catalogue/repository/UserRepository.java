package com.catalogue.repository;

import com.catalogue.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailAndEnterpriseEntId(String email, String entId);
    Optional<User> findByUsernameAndEnterpriseEntId(String username, String entId);
    List<User> findByEnterpriseEntIdAndIsActiveTrue(String entId);
    boolean existsByEmailAndEnterpriseEntId(String email, String entId);
    boolean existsByUsernameAndEnterpriseEntId(String username, String entId);
}
