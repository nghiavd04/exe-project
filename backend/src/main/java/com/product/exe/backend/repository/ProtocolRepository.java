package com.product.exe.backend.repository;

import com.product.exe.backend.entity.Protocol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProtocolRepository extends JpaRepository<Protocol, Long> {
    Optional<Protocol> findByCode(String code);
    boolean existsByCode(String code);
}
