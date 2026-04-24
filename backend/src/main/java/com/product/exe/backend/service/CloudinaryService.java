package com.product.exe.backend.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;

public interface CloudinaryService {
    Map upload(MultipartFile file) throws IOException;
    Map upload(MultipartFile file, String folder) throws IOException;
    Map delete(String publicId) throws IOException;
}
