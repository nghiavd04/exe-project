package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ProtocolRequest;
import com.product.exe.backend.entity.Protocol;
import java.util.List;

public interface ProtocolService {
    List<Protocol> getAllProtocols();
    List<Protocol> getActiveProtocols();
    Protocol getProtocolById(Long id);
    Protocol createProtocol(ProtocolRequest request);
    Protocol updateProtocol(Long id, ProtocolRequest request);
    void deleteProtocol(Long id);
}
