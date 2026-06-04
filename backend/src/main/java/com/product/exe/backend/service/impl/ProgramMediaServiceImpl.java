package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.request.ProgramMediaRequest;
import com.product.exe.backend.dto.response.CustomerProgramMediaResponse;
import com.product.exe.backend.entity.ProgramMedia;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ProgramMediaRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.CloudinaryService;
import com.product.exe.backend.service.ProgramMediaService;
import com.product.exe.backend.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProgramMediaServiceImpl implements ProgramMediaService {

    private final ProgramMediaRepository programMediaRepository;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final CloudinaryService cloudinaryService;

    @Override
    public List<ProgramMedia> getAllForAdmin() {
        return programMediaRepository.findAllByOrderByDayNumberAsc();
    }

    @Override
    public ProgramMedia getByIdForAdmin(Long id) {
        return programMediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài nguyên đa phương tiện với ID: " + id));
    }

    @Override
    @Transactional
    public ProgramMedia create(ProgramMediaRequest request) {
        ProgramMedia media = ProgramMedia.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .mediaType(request.getMediaType())
                .targetTier(request.getTargetTier())
                .mediaUrl(request.getMediaUrl())
                .publicId(request.getPublicId())
                .dayNumber(request.getDayNumber())
                .build();
        return programMediaRepository.save(media);
    }

    @Override
    @Transactional
    public ProgramMedia update(Long id, ProgramMediaRequest request) {
        ProgramMedia media = getByIdForAdmin(id);
        
        // Nếu thay đổi file, hãy xóa asset cũ trên Cloudinary để giải phóng dung lượng
        if (media.getPublicId() != null && !media.getPublicId().equals(request.getPublicId())) {
            try {
                cloudinaryService.delete(media.getPublicId());
                log.info("Deleted old Cloudinary asset: {}", media.getPublicId());
            } catch (IOException e) {
                log.error("Failed to delete Cloudinary asset: {}", media.getPublicId(), e);
            }
        }

        media.setTitle(request.getTitle());
        media.setDescription(request.getDescription());
        media.setMediaType(request.getMediaType());
        media.setTargetTier(request.getTargetTier());
        media.setMediaUrl(request.getMediaUrl());
        media.setPublicId(request.getPublicId());
        media.setDayNumber(request.getDayNumber());

        return programMediaRepository.save(media);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        ProgramMedia media = getByIdForAdmin(id);
        if (media.getPublicId() != null) {
            try {
                cloudinaryService.delete(media.getPublicId());
                log.info("Deleted Cloudinary asset for media ID {}: {}", id, media.getPublicId());
            } catch (IOException e) {
                log.error("Failed to delete Cloudinary asset on deletion: {}", media.getPublicId(), e);
            }
        }
        programMediaRepository.delete(media);
    }

    @Override
    public List<CustomerProgramMediaResponse> getAllForCustomer(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy người dùng"));

        SubscriptionTier userTier = subscriptionService.getUserHighestTier(user.getId());
        int userWeight = userTier.getWeight();

        List<ProgramMedia> allMedia = programMediaRepository.findAllByOrderByDayNumberAsc();
        List<CustomerProgramMediaResponse> responseList = new ArrayList<>();

        for (ProgramMedia media : allMedia) {
            // Kiểm tra phân quyền theo tier weight
            boolean isLocked = userWeight < media.getTargetTier().getWeight();
            
            CustomerProgramMediaResponse response = CustomerProgramMediaResponse.builder()
                    .id(media.getId())
                    .title(media.getTitle())
                    .description(media.getDescription())
                    .mediaType(media.getMediaType())
                    .targetTier(media.getTargetTier())
                    .dayNumber(media.getDayNumber())
                    .locked(isLocked)
                    .mediaUrl(isLocked ? null : media.getMediaUrl()) // Ẩn link file nếu bị khóa
                    .createdAt(media.getCreatedAt())
                    .build();
            
            responseList.add(response);
        }

        return responseList;
    }
}
