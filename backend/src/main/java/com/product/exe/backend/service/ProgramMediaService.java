package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ProgramMediaRequest;
import com.product.exe.backend.dto.response.CustomerProgramMediaResponse;
import com.product.exe.backend.entity.ProgramMedia;

import com.product.exe.backend.enums.MediaType;
import com.product.exe.backend.enums.SubscriptionTier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProgramMediaService {
    Page<ProgramMedia> getAllForAdmin(String search, MediaType type, SubscriptionTier tier, Pageable pageable);
    ProgramMedia getByIdForAdmin(Long id);
    ProgramMedia create(ProgramMediaRequest request);
    ProgramMedia update(Long id, ProgramMediaRequest request);
    void delete(Long id);

    Page<CustomerProgramMediaResponse> getAllForCustomer(String email, MediaType type, Pageable pageable);
}
