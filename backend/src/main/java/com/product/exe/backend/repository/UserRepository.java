package com.product.exe.backend.repository;

import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    long countByRole(Role role);
    java.util.List<User> findByRoleAndIsActive(Role role, Boolean isActive);

    @Query("SELECT u FROM User u " +
            "LEFT JOIN u.customer c " +
            "LEFT JOIN u.admin a " +
            "WHERE (:search IS NULL OR u.email LIKE %:search% OR " +
            "       (u.role = 'CUSTOMER' AND c.fullName LIKE %:search%) OR " +
            "       (u.role = 'ADMIN' AND a.fullName LIKE %:search%)) " +
            "AND (:role IS NULL OR u.role = :role) " +
            "AND (:isActive IS NULL OR u.isActive = :isActive)")
    Page<User> findAllUsersWithFilter(
            @Param("search") String search,
            @Param("role") Role role,
            @Param("isActive") Boolean isActive,
            Pageable pageable);
}
