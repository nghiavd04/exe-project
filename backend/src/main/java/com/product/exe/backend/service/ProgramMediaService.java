package com.product.exe.backend.service;

import com.product.exe.backend.dto.request.ProgramMediaRequest;
import com.product.exe.backend.dto.response.CustomerProgramMediaResponse;
import com.product.exe.backend.entity.ProgramMedia;

import java.util.List;

public interface ProgramMediaService {
    List<ProgramMedia> getAllForAdmin();
    ProgramMedia getByIdForAdmin(Long id);
    ProgramMedia create(ProgramMediaRequest request);
    ProgramMedia update(Long id, ProgramMediaRequest request);
    void delete(Long id);

    List<CustomerProgramMediaResponse> getAllForCustomer(String email);
}
