package com.product.exe.backend.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.product.exe.backend.service.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryServiceImpl implements CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    @Override
    public Map upload(MultipartFile file) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap("resource_type", "auto"));
    }

    @Override
    public Map upload(MultipartFile file, String folder) throws IOException {
        return cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("folder", folder, "resource_type", "auto"));
    }

    @Override
    public Map delete(String publicId) throws IOException {
        return cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }
}
