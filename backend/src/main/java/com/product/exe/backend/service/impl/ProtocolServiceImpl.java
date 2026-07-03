package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ProtocolRequest;
import com.product.exe.backend.entity.Protocol;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ProtocolRepository;
import com.product.exe.backend.service.ProtocolService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProtocolServiceImpl implements ProtocolService {

    private final ProtocolRepository protocolRepository;

    @Override
    public List<Protocol> getAllProtocols() {
        return protocolRepository.findAll();
    }

    @Override
    public List<Protocol> getActiveProtocols() {
        return protocolRepository.findAll().stream()
                .filter(Protocol::getIsActive)
                .collect(Collectors.toList());
    }

    @Override
    public Protocol getProtocolById(Long id) {
        return protocolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phác đồ với ID: " + id));
    }

    @Override
    @Transactional
    public Protocol createProtocol(ProtocolRequest request) {
        if (protocolRepository.existsByCode(request.getCode())) {
            throw new BadRequestException("Mã phác đồ đã tồn tại: " + request.getCode());
        }

        Protocol protocol = Protocol.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .selectionPolicy(request.getSelectionPolicy() != null ? request.getSelectionPolicy() : "USER_SELECT")
                .minTierRequired(request.getMinTierRequired() != null ? request.getMinTierRequired() : "BASIC")
                .durationDays(request.getDurationDays())
                .weightsJson(request.getWeightsJson())
                .isActive(true)
                .build();

        return protocolRepository.save(protocol);
    }

    @Override
    @Transactional
    public Protocol updateProtocol(Long id, ProtocolRequest request) {
        Protocol protocol = getProtocolById(id);

        if (request.getCode() != null && !request.getCode().equals(protocol.getCode())) {
            if (protocolRepository.existsByCode(request.getCode())) {
                throw new BadRequestException("Mã phác đồ đã tồn tại: " + request.getCode());
            }
            protocol.setCode(request.getCode());
        }

        if (request.getName() != null) {
            protocol.setName(request.getName());
        }
        if (request.getDescription() != null) {
            protocol.setDescription(request.getDescription());
        }
        if (request.getSelectionPolicy() != null) {
            protocol.setSelectionPolicy(request.getSelectionPolicy());
        }
        if (request.getMinTierRequired() != null) {
            protocol.setMinTierRequired(request.getMinTierRequired());
        }
        if (request.getDurationDays() != null) {
            protocol.setDurationDays(request.getDurationDays());
        }
        if (request.getWeightsJson() != null) {
            protocol.setWeightsJson(request.getWeightsJson());
        }

        return protocolRepository.save(protocol);
    }

    @Override
    @Transactional
    public void deleteProtocol(Long id) {
        Protocol protocol = getProtocolById(id);
        protocolRepository.delete(protocol);
    }
}
