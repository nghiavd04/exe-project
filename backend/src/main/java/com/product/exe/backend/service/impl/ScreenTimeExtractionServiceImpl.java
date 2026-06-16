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

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.RenderingHints;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class ScreenTimeExtractionServiceImpl implements ScreenTimeExtractionService {

    private final UserRepository userRepository;
    private final ScreenTimeRecordRepository screenTimeRecordRepository;

    private String getTessDataPath() {
        String envPath = System.getenv("TESSDATA_PREFIX");
        if (envPath != null && !envPath.isEmpty()) {
            return envPath;
        }

        String[] possiblePaths = {
                "tessdata",
                "/usr/share/tesseract-ocr/4.00/tessdata",
                "/usr/share/tesseract-ocr/5.00/tessdata"
        };

        for (String path : possiblePaths) {
            File dir = new File(path);
            if (dir.exists() && dir.isDirectory()) {
                File vieData = new File(dir, "vie.traineddata");
                if (vieData.exists()) {
                    return dir.getAbsolutePath();
                }
            }
        }
        return new File("tessdata").getAbsolutePath();
    }

    @PostConstruct
    public void init() {
        File tessDataDir = new File(getTessDataPath());
        if (!tessDataDir.exists() && tessDataDir.mkdirs()) {
            log.info("Created tessdata directory: {}", tessDataDir.getAbsolutePath());
        }

        downloadTrainedDataIfMissing("eng");
        downloadTrainedDataIfMissing("vie");
    }

    private void downloadTrainedDataIfMissing(String lang) {
        File dataFile = new File(getTessDataPath(), lang + ".traineddata");
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

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng với email: " + email));

        Tesseract tesseract = new Tesseract();
        tesseract.setDatapath(getTessDataPath());
        tesseract.setLanguage("eng+vie");
        tesseract.setTessVariable("user_defined_dpi", "300");
        tesseract.setTessVariable("preserve_interword_spaces", "1");

        String extractedText;
        try (InputStream inputStream = file.getInputStream()) {
            BufferedImage image = ImageIO.read(inputStream);

            if (image == null) {
                throw new BadRequestException("File tải lên không phải là ảnh hợp lệ.");
            }

            log.info("Starting OCR extraction from uploaded image");

            extractedText = extractTextFromImage(tesseract, image);

            log.info("OCR completed. Character length: {}", extractedText.length());
            log.debug("OCR Extracted Text:\n{}", extractedText);
        } catch (IOException e) {
            log.error("Failed to read uploaded image", e);
            throw new BadRequestException("Không thể đọc file ảnh.");
        } catch (TesseractException e) {
            log.error("Tess4J OCR operation failed", e);
            throw new BadRequestException("Không thể nhận diện văn bản từ ảnh: " + e.getMessage());
        }

        Integer minutes = parseScreenTime(extractedText);
        if (minutes == null) {
            log.warn("Regex parser failed to extract screen time from text:\n{}", extractedText);
            throw new BadRequestException("Không tìm thấy thời gian sử dụng điện thoại hợp lệ từ ảnh screenshot. "
                    + "Vui lòng đảm bảo ảnh chụp chứa thông tin thời gian sử dụng (ví dụ: 4h 32m, 4 hr 32 min, 4:32).");
        }

        LocalDate today = LocalDate.now();

        ScreenTimeRecord record = ScreenTimeRecord.builder()
                .userId(user.getId())
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

    private String extractTextFromImage(Tesseract tesseract, BufferedImage image) throws TesseractException {
        StringBuilder extractedText = new StringBuilder();

        tesseract.setPageSegMode(3);
        appendOcrResult(extractedText, tesseract.doOCR(image));

        BufferedImage scaledImage = scaleImage(image, 4);
        appendOcrResult(extractedText, tesseract.doOCR(scaledImage));

        BufferedImage highContrastImage = toHighContrastGrayscale(scaledImage);
        appendOcrResult(extractedText, tesseract.doOCR(highContrastImage));

        for (Rectangle cropRegion : getScreenTimeCandidateRegions(image)) {
            BufferedImage crop = cropImage(image, cropRegion);
            BufferedImage scaledCrop = scaleImage(crop, 6);
            BufferedImage highContrastCrop = toHighContrastGrayscale(scaledCrop);

            tesseract.setPageSegMode(6);
            appendOcrResult(extractedText, tesseract.doOCR(scaledCrop));
            appendOcrResult(extractedText, tesseract.doOCR(highContrastCrop));

            tesseract.setPageSegMode(7);
            appendOcrResult(extractedText, tesseract.doOCR(scaledCrop));
            appendOcrResult(extractedText, tesseract.doOCR(highContrastCrop));
        }

        return extractedText.toString();
    }

    private Rectangle[] getScreenTimeCandidateRegions(BufferedImage image) {
        int width = image.getWidth();
        int height = image.getHeight();

        return new Rectangle[] {
                region(width, height, 0.00, 0.00, 1.00, 0.55),
                region(width, height, 0.06, 0.18, 0.88, 0.28),
                region(width, height, 0.07, 0.25, 0.48, 0.15),
                region(width, height, 0.08, 0.29, 0.42, 0.11),
                region(width, height, 0.10, 0.30, 0.35, 0.09),
                region(width, height, 0.03, 0.12, 0.62, 0.35)
        };
    }

    private Rectangle region(int imageWidth, int imageHeight, double x, double y, double width, double height) {
        int regionX = Math.max(0, (int) Math.round(imageWidth * x));
        int regionY = Math.max(0, (int) Math.round(imageHeight * y));
        int regionWidth = Math.min(imageWidth - regionX, Math.max(1, (int) Math.round(imageWidth * width)));
        int regionHeight = Math.min(imageHeight - regionY, Math.max(1, (int) Math.round(imageHeight * height)));
        return new Rectangle(regionX, regionY, regionWidth, regionHeight);
    }

    private BufferedImage cropImage(BufferedImage source, Rectangle region) {
        BufferedImage crop = new BufferedImage(region.width, region.height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = crop.createGraphics();
        try {
            graphics.drawImage(
                    source,
                    0,
                    0,
                    region.width,
                    region.height,
                    region.x,
                    region.y,
                    region.x + region.width,
                    region.y + region.height,
                    Color.WHITE,
                    null);
        } finally {
            graphics.dispose();
        }
        return crop;
    }

    private void appendOcrResult(StringBuilder target, String text) {
        if (text == null || text.isBlank()) {
            return;
        }
        if (target.length() > 0) {
            target.append('\n');
        }
        target.append(text);
    }

    private BufferedImage scaleImage(BufferedImage source, int scale) {
        BufferedImage scaled = new BufferedImage(
                source.getWidth() * scale,
                source.getHeight() * scale,
                BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = scaled.createGraphics();
        try {
            graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BICUBIC);
            graphics.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
            graphics.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
            graphics.drawImage(source, 0, 0, scaled.getWidth(), scaled.getHeight(), Color.WHITE, null);
        } finally {
            graphics.dispose();
        }
        return scaled;
    }

    private BufferedImage toHighContrastGrayscale(BufferedImage source) {
        BufferedImage processed = new BufferedImage(source.getWidth(), source.getHeight(), BufferedImage.TYPE_BYTE_GRAY);
        Graphics2D graphics = processed.createGraphics();
        try {
            graphics.drawImage(source, 0, 0, null);
        } finally {
            graphics.dispose();
        }

        for (int y = 0; y < processed.getHeight(); y++) {
            for (int x = 0; x < processed.getWidth(); x++) {
                int rgb = processed.getRGB(x, y);
                int gray = rgb & 0xff;
                int adjusted = gray < 170 ? 0 : 255;
                int adjustedRgb = new Color(adjusted, adjusted, adjusted).getRGB();
                processed.setRGB(x, y, adjustedRgb);
            }
        }
        return processed;
    }

    public Integer parseScreenTime(String text) {
        if (text == null || text.trim().isEmpty()) {
            return null;
        }

        String cleanText = text.toLowerCase().replaceAll("\\s+", " ");

        Pattern patternHrMin = Pattern.compile("(\\d+)\\s*(?:hours|hour|h|hr|hrs|gio|gi\\S*|g)[\\s,.;:-]*(\\d+)\\s*(?:minutes|minute|m|min|mins|phut|ph\\S*t|p)");
        Matcher matcherHrMin = patternHrMin.matcher(cleanText);
        if (matcherHrMin.find()) {
            int hours = Integer.parseInt(matcherHrMin.group(1));
            int minutes = Integer.parseInt(matcherHrMin.group(2));
            log.info("Parsed format (Hours + Minutes): {}h {}m", hours, minutes);
            return hours * 60 + minutes;
        }

        Pattern patternHrBareMin = Pattern.compile("(\\d+)\\s*(?:hours|hour|h|hr|hrs|gio|gi\\S*|g)[\\s,.;:-]*(\\d{1,2})(?!\\d)");
        Matcher matcherHrBareMin = patternHrBareMin.matcher(cleanText);
        if (matcherHrBareMin.find()) {
            int hours = Integer.parseInt(matcherHrBareMin.group(1));
            int minutes = Integer.parseInt(matcherHrBareMin.group(2));
            log.info("Parsed format (Hours + Bare Minutes): {}h {}m", hours, minutes);
            return hours * 60 + minutes;
        }

        Pattern patternColon = Pattern.compile("(\\d{1,2}):(\\d{2})");
        Matcher matcherColon = patternColon.matcher(cleanText);
        if (matcherColon.find()) {
            int hours = Integer.parseInt(matcherColon.group(1));
            int minutes = Integer.parseInt(matcherColon.group(2));
            log.info("Parsed format (HH:MM): {}:{}", hours, minutes);
            return hours * 60 + minutes;
        }

        Pattern patternHrOnly = Pattern.compile("(\\d+)\\s*(?:hours|hour|h|hr|hrs|gio|gi\\S*|g)(?!\\w)");
        Matcher matcherHrOnly = patternHrOnly.matcher(cleanText);
        if (matcherHrOnly.find()) {
            int hours = Integer.parseInt(matcherHrOnly.group(1));
            log.info("Parsed format (Hours only): {}h", hours);
            return hours * 60;
        }

        Pattern patternMinOnly = Pattern.compile("(\\d+)\\s*(?:minutes|minute|m|min|mins|phut|ph\\S*t|p)(?!\\w)");
        Matcher matcherMinOnly = patternMinOnly.matcher(cleanText);
        if (matcherMinOnly.find()) {
            int minutes = Integer.parseInt(matcherMinOnly.group(1));
            log.info("Parsed format (Minutes only): {}m", minutes);
            return minutes;
        }

        return null;
    }
}
