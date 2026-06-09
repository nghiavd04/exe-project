package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.ScreenTimeUploadResponse;
import com.product.exe.backend.entity.ScreenTimeRecord;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.exception.ResourceNotFoundException;
import com.product.exe.backend.repository.ScreenTimeRecordRepository;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.ScreenTimeExtractionService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import javax.imageio.ImageIO;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenTimeExtractionServiceImpl implements ScreenTimeExtractionService {

    private final UserRepository userRepository;
    private final ScreenTimeRecordRepository screenTimeRecordRepository;

    private static final String TESSDATA_DIR = "tessdata";
    private static final String UPLOADS_DIR = "uploads";

    @PostConstruct
    public void init() {
        // Ensure directories exist
        File uploadsDir = new File(UPLOADS_DIR);
        if (!uploadsDir.exists()) {
            if (uploadsDir.mkdirs()) {
                log.info("Created uploads directory: {}", uploadsDir.getAbsolutePath());
            }
        }

        File tessDataDir = new File(TESSDATA_DIR);
        if (!tessDataDir.exists()) {
            if (tessDataDir.mkdirs()) {
                log.info("Created tessdata directory: {}", tessDataDir.getAbsolutePath());
            }
        }

        // Pre-download traineddata if not exists
        downloadTrainedDataIfMissing("eng");
        downloadTrainedDataIfMissing("vie");
    }

    private void downloadTrainedDataIfMissing(String lang) {
        File dataFile = new File(TESSDATA_DIR, lang + ".traineddata");
        if (!dataFile.exists()) {
            String downloadUrl = "https://github.com/tesseract-ocr/tessdata_fast/raw/main/" + lang + ".traineddata";
            log.info("Trained data for language '{}' is missing. Downloading from: {}", lang, downloadUrl);
            try {
                URL url = new URL(downloadUrl);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setInstanceFollowRedirects(true);
                conn.setRequestMethod("GET");
                conn.setConnectTimeout(15000);
                conn.setReadTimeout(15000);

                int status = conn.getResponseCode();
                if (status >= 300 && status < 400) {
                    String redirectUrl = conn.getHeaderField("Location");
                    if (redirectUrl != null) {
                        url = new URL(redirectUrl);
                        conn = (HttpURLConnection) url.openConnection();
                        conn.setConnectTimeout(15000);
                        conn.setReadTimeout(15000);
                    }
                }

                try (InputStream in = conn.getInputStream()) {
                    Files.copy(in, dataFile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                    log.info("Successfully downloaded trained data for language '{}'. File size: {} bytes", lang, dataFile.length());
                }
            } catch (Exception e) {
                log.error("Failed to download trained data for language '{}': {}. OCR features may fail.", lang, e.getMessage(), e);
            }
        } else {
            log.info("Trained data for language '{}' already exists at: {}", lang, dataFile.getAbsolutePath());
        }
    }

    @Override
    public ScreenTimeUploadResponse extractScreenTime(MultipartFile file, String email) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn ảnh screenshot thời gian sử dụng.");
        }

        // Fetch User
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        // Save File Locally
        

        // Run OCR using Tess4J
        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(new File(TESSDATA_DIR).getAbsolutePath());
        tesseract.setLanguage("eng+vie"); // Support both English and Vietnamese

        String extractedText;
        try {
            BufferedImage image = ImageIO.read(file.getInputStream());

            if (image == null) {
                throw new BadRequestException("File tải lên không phải là ảnh hợp lệ.");
            }

            log.info("Starting OCR extraction from uploaded image");

            extractedText = tesseract.doOCR(image);

            log.info("OCR completed. Character length: {}", extractedText.length());
            log.debug("OCR Extracted Text:\n{}", extractedText);

        } catch (IOException e) {
            log.error("Failed to read uploaded image", e);
            throw new BadRequestException("Không thể đọc file ảnh.");
        } catch (TesseractException e) {
            log.error("Tess4J OCR operation failed", e);
            throw new BadRequestException("Không thể nhận diện văn bản từ ảnh: " + e.getMessage());
        }

        // Extract Screen Time Minutes
        Integer minutes = parseScreenTime(extractedText);
        if (minutes == null) {
            log.warn("Regex parser failed to extract screen time from text:\n{}", extractedText);
            throw new BadRequestException("Không tìm thấy thời gian sử dụng điện thoại hợp lệ từ ảnh screenshot. " +
                    "Vui lòng đảm bảo ảnh chụp chứa thông tin thời gian sử dụng (ví dụ: 4h 32m, 4 hr 32 min, 4:32, 4 giờ 32 phút).");
        }

        LocalDate today = LocalDate.now();

        // Save ScreenTimeRecord to MySQL database
        ScreenTimeRecord record = ScreenTimeRecord.builder()
                .userId(user.getId())
                .imagePath("uploaded-image")
                .extractedText(extractedText)
                .screenTimeMinutes(minutes)
                .captureDate(today)
                .build();

        screenTimeRecordRepository.save(record);
        log.info("Successfully processed screen time: {} mins, captureDate: {}", minutes, today);

        return ScreenTimeUploadResponse.builder()
                .screenTimeMinutes(minutes)
                .captureDate(today)
                .build();
    }

    public Integer parseScreenTime(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        // Normalize text: lowercase, replace multiple whitespaces with a single space
        String cleanText = text.toLowerCase().replaceAll("\\s+", " ");

        // Pattern 1: Combined hours and minutes
        // Examples: "4h 32m", "4h32m", "4 hr 32 min", "4 hrs 32 mins", "4 giờ 32 phút", "4g 32p"
        Pattern patternHrMin = Pattern.compile("(\\d+)\\s*(?:hours|hour|h|hr|hrs|giờ|g)\\s*(\\d+)\\s*(?:minutes|minute|m|min|mins|phút|p)");
        Matcher matcherHrMin = patternHrMin.matcher(cleanText);
        if (matcherHrMin.find()) {
            int hours = Integer.parseInt(matcherHrMin.group(1));
            int minutes = Integer.parseInt(matcherHrMin.group(2));
            log.info("Parsed format (Hours + Minutes): {}h {}m", hours, minutes);
            return hours * 60 + minutes;
        }

        // Pattern 2: Digital format (HH:MM or H:MM)
        // Examples: "4:32", "04:32"
        Pattern patternColon = Pattern.compile("(\\d{1,2}):(\\d{2})");
        Matcher matcherColon = patternColon.matcher(cleanText);
        if (matcherColon.find()) {
            int hours = Integer.parseInt(matcherColon.group(1));
            int minutes = Integer.parseInt(matcherColon.group(2));
            log.info("Parsed format (HH:MM): {}:{}", hours, minutes);
            return hours * 60 + minutes;
        }

        // Pattern 3: Hours only
        // Examples: "4h", "4 hr", "4 hours", "4 giờ"
        Pattern patternHrOnly = Pattern.compile("(\\d+)\\s*(?:hours|hour|h|hr|hrs|giờ|g)(?!\\w)");
        Matcher matcherHrOnly = patternHrOnly.matcher(cleanText);
        if (matcherHrOnly.find()) {
            int hours = Integer.parseInt(matcherHrOnly.group(1));
            log.info("Parsed format (Hours only): {}h", hours);
            return hours * 60;
        }

        // Pattern 4: Minutes only
        // Examples: "32m", "32 min", "32 mins", "32 phút", "32p"
        Pattern patternMinOnly = Pattern.compile("(\\d+)\\s*(?:minutes|minute|m|min|mins|phút|p)(?!\\w)");
        Matcher matcherMinOnly = patternMinOnly.matcher(cleanText);
        if (matcherMinOnly.find()) {
            int minutes = Integer.parseInt(matcherMinOnly.group(1));
            log.info("Parsed format (Minutes only): {}m", minutes);
            return minutes;
        }

        return null;
    }
}
