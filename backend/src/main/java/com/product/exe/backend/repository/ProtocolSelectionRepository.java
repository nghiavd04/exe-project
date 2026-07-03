package com.product.exe.backend.repository;

import com.product.exe.backend.entity.ProtocolSelection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProtocolSelectionRepository extends JpaRepository<ProtocolSelection, Long> {
    List<ProtocolSelection> findByCustomerIdAndStatus(Long customerId, String status);
    Optional<ProtocolSelection> findFirstByCustomerIdAndStatusOrderBySelectedAtDesc(Long customerId, String status);
}
