package com.product.exe.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.service.GeminiService;
import com.product.exe.backend.service.SystemConfigService;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;


@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiServiceImpl implements GeminiService {

    private final SystemConfigService systemConfigService;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.keys:}")
    private String apiKeysRaw;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String primaryModel;

    @Value("${gemini.model.fallbacks:}")
    private String fallbackModelsRaw;

    @Value("${gemini.retry.max-attempts:3}")
    private int maxRetryAttempts;

    @Value("${gemini.retry.initial-delay-ms:1000}")
    private long initialDelayMs;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    /** Danh sách API keys để xoay vòng (round-robin) */
    private List<String> apiKeys;
    private final AtomicInteger keyIndex = new AtomicInteger(0);

    /** Danh sách tất cả models theo thứ tự ưu tiên: primary → fallback1 → fallback2 → ... */
    private List<String> modelChain;

    @PostConstruct
    public void init() {
        // Khởi tạo danh sách API keys
        apiKeys = new ArrayList<>();
        if (apiKeysRaw != null && !apiKeysRaw.isBlank()) {
            Arrays.stream(apiKeysRaw.split(","))
                    .map(String::trim)
                    .filter(k -> !k.isEmpty())
                    .forEach(apiKeys::add);
        }
        if (apiKeys.isEmpty() && apiKey != null && !apiKey.isBlank()) {
            apiKeys.add(apiKey.trim());
        }

        // Khởi tạo model chain: primary model + tất cả fallback models
        modelChain = new ArrayList<>();
        if (primaryModel != null && !primaryModel.isBlank()) {
            modelChain.add(primaryModel.trim());
        }
        if (fallbackModelsRaw != null && !fallbackModelsRaw.isBlank()) {
            Arrays.stream(fallbackModelsRaw.split(","))
                    .map(String::trim)
                    .filter(m -> !m.isEmpty() && !modelChain.contains(m))
                    .forEach(modelChain::add);
        }

        log.info("Gemini initialized - {} API key(s), {} model(s) in chain: {}",
                apiKeys.size(), modelChain.size(), modelChain);
    }

    /**
     * Lấy API key tiếp theo theo round-robin.
     */
    private String getNextApiKey() {
        if (apiKeys.isEmpty()) return null;
        int idx = keyIndex.getAndUpdate(i -> (i + 1) % apiKeys.size());
        return apiKeys.get(idx);
    }

    @Override
    public String getChatResponse(List<ChatMessage> history, String userPrompt) {
        return getChatResponse(history, userPrompt, null);
    }

    @Override
    public String getChatResponse(List<ChatMessage> history, String userPrompt, String contextHint) {
        // Kiểm tra API key hợp lệ
        if (apiKeys.isEmpty() || apiKeys.stream().allMatch(k -> k.contains("PlaceholderKey"))) {
            log.warn("Gemini API Key is not configured or is placeholder. Returning mock response.");
            return "Xin chào! Tôi là Trợ lý AI của bạn. Hiện tại hệ thống đang gặp sự cố. Vui lòng thử lại sau!";
        }

        // Build request payload (chung cho tất cả models)
        String jsonPayload;
        try {
            jsonPayload = buildRequestPayload(history, userPrompt, contextHint);
        } catch (Exception e) {
            log.error("Error building Gemini request payload", e);
            return "Không thể tạo yêu cầu đến dịch vụ AI. Lỗi: " + e.getMessage();
        }

        // Thử từng model trong chain với retry
        for (int modelIdx = 0; modelIdx < modelChain.size(); modelIdx++) {
            String model = modelChain.get(modelIdx);
            boolean isLastModel = (modelIdx == modelChain.size() - 1);

            String result = tryModelWithRetry(model, jsonPayload, isLastModel);
            if (result != null) {
                if (modelIdx > 0) {
                    log.info("Successfully used fallback model: {}", model);
                }
                return result;
            }
            // result == null → model này thất bại, thử model tiếp theo
            log.warn("Model '{}' failed after retries. Trying next fallback model...", model);
        }

        // Tất cả models đều thất bại
        return "Hệ thống AI đang quá tải. Vui lòng thử lại sau vài phút!";
    }

    /**
     * Thử gọi 1 model cụ thể với retry + exponential backoff + key rotation.
     *
     * @return Câu trả lời nếu thành công, null nếu model bị quá tải (503/429) sau tất cả retries
     */
    private String tryModelWithRetry(String model, String jsonPayload, boolean isLastModel) {
        for (int attempt = 0; attempt <= maxRetryAttempts; attempt++) {
            String currentKey = getNextApiKey();
            if (currentKey == null) return null;

            try {
                String url = "https://generativelanguage.googleapis.com/v1beta/models/"
                        + model + ":generateContent?key=" + currentKey;

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

                int statusCode = response.statusCode();

                // Thành công
                if (statusCode == 200) {
                    return extractResponseText(response.body());
                }

                // Lỗi API key không hợp lệ → trả lỗi ngay, không retry
                if (response.body().contains("API key not valid")) {
                    log.error("Invalid API key detected for model: {}", model);
                    return "Khóa API Gemini của hệ thống không hợp lệ. Vui lòng kiểm tra lại";
                }

                // Lỗi 503 (quá tải) hoặc 429 (rate limit) → retry với exponential backoff
                if ((statusCode == 503 || statusCode == 429) && attempt < maxRetryAttempts) {
                    long delayMs = initialDelayMs * (long) Math.pow(2, attempt);
                    log.warn("Gemini API returned {} for model '{}' (key #{}). Retrying in {}ms (attempt {}/{})",
                            statusCode, model, keyIndex.get(), delayMs, attempt + 1, maxRetryAttempts);
                    Thread.sleep(delayMs);
                    continue;
                }

                // Lỗi 503/429 nhưng hết retry → return null để thử fallback model
                if (statusCode == 503 || statusCode == 429) {
                    log.error("Gemini model '{}' exhausted all {} retries with status {}",
                            model, maxRetryAttempts, statusCode);
                    return null;
                }

                // Các lỗi khác (400, 403, 500...) → trả lỗi ngay
                log.error("Gemini API call failed with status: {}, model: {}, response: {}",
                        statusCode, model, response.body());
                return "Đã xảy ra lỗi khi trao đổi với AI (Mã lỗi: " + statusCode + "). Vui lòng thử lại sau!";

            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                log.error("Retry interrupted for model: {}", model);
                return "Quá trình xử lý bị gián đoạn. Vui lòng thử lại!";
            } catch (Exception e) {
                log.error("Error communicating with Gemini API (model: {})", model, e);
                if (isLastModel) {
                    return "Không thể kết nối với dịch vụ AI. Lỗi: " + e.getMessage();
                }
                return null; // Thử model tiếp theo
            }
        }
        return null;
    }

    /**
     * Build JSON payload cho Gemini API request.
     */
    private String buildRequestPayload(List<ChatMessage> history, String userPrompt, String contextHint) throws Exception {
        List<Map<String, Object>> contents = new ArrayList<>();

        // Chỉ gửi tối đa 20 tin nhắn gần nhất để tối ưu hóa quota/token
        int startIdx = Math.max(0, history.size() - 20);
        for (int i = startIdx; i < history.size(); i++) {
            ChatMessage msg = history.get(i);
            contents.add(Map.of(
                "role", msg.getRole(),
                "parts", List.of(Map.of("text", msg.getContent()))
            ));
        }

        // Thêm tin nhắn mới nhất của user
        contents.add(Map.of(
            "role", "user",
            "parts", List.of(Map.of("text", userPrompt))
        ));

        // Định nghĩa System Instruction định hướng AI - Dopaless AI (đọc động từ DB)
        String baseInstruction = systemConfigService.getOrSetDefaultValue(
                "GEMINI_SYSTEM_INSTRUCTION",
                "Bạn là Dopaless AI, trợ lý hỗ trợ người dùng xây dựng thói quen sử dụng công nghệ lành mạnh và quản lý dopamine trong cuộc sống hàng ngày.\n\n" +
                "MỤC TIÊU:\n" +
                "- Hỗ trợ người dùng hiểu về dopamine, thói quen, sự tập trung, quản lý thời gian sử dụng mạng xã hội và sức khỏe số.\n" +
                "- Đưa ra lời khuyên mang tính giáo dục, thực tế và an toàn.\n" +
                "- Khuyến khích xây dựng thói quen tích cực, cân bằng cuộc sống và sử dụng công nghệ có ý thức.\n\n" +
                "PHẠM VI ĐƯỢC PHÉP TRẢ LỜI:\n" +
                "- Dopamine và cơ chế phần thưởng trong não.\n" +
                "- Cai nghiện mạng xã hội, TikTok, Facebook, Instagram, YouTube, game.\n" +
                "- Quản lý thời gian sử dụng điện thoại.\n" +
                "- Tập trung học tập và làm việc.\n" +
                "- Xây dựng thói quen tốt.\n" +
                "- Digital Detox.\n" +
                "- Mindfulness cơ bản.\n" +
                "- Quản lý sự trì hoãn.\n" +
                "- Các bài tập giúp giảm phụ thuộc vào thiết bị điện tử.\n" +
                "- Giải thích các bài kiểm tra, thống kê và kết quả đánh giá trong hệ thống Dopaless.\n\n" +
                "KHÔNG ĐƯỢC:\n" +
                "- Trả lời các câu hỏi không liên quan đến dopamine, thói quen, sức khỏe số hoặc mục tiêu của Dopaless.\n" +
                "- Thảo luận chính trị, tôn giáo, tài chính, pháp luật hoặc các chủ đề ngoài phạm vi.\n" +
                "- Đưa ra chẩn đoán y khoa hoặc tâm thần.\n" +
                "- Tuyên bố người dùng mắc bất kỳ bệnh lý nào.\n" +
                "- Đưa ra lời khuyên thay thế bác sĩ hoặc chuyên gia tâm lý.\n" +
                "- Hướng dẫn tự gây hại, bạo lực, chất kích thích hoặc hành vi nguy hiểm.\n" +
                "- Sử dụng ngôn ngữ gây hoảng sợ, kỳ thị hoặc đánh giá người dùng.\n\n" +
                "KHI NGƯỜI DÙNG HỎI NGOÀI PHẠM VI:\n" +
                "Trả lời: \"Tôi là trợ lý của Dopaless và chỉ hỗ trợ các chủ đề liên quan đến dopamine, thói quen, quản lý thời gian sử dụng thiết bị và sức khỏe số. Hãy đặt câu hỏi trong các lĩnh vực này để tôi có thể hỗ trợ bạn.\"\n\n" +
                "LƯU Ý AN TOÀN:\n" +
                "- Luôn giải thích rằng thông tin chỉ mang tính giáo dục.\n" +
                "- Không khẳng định các thông tin y khoa chưa được xác thực.\n" +
                "- Nếu người dùng mô tả tình trạng sức khỏe nghiêm trọng hoặc khủng hoảng tâm lý, khuyến khích họ tìm kiếm sự hỗ trợ từ chuyên gia hoặc cơ sở y tế phù hợp.\n" +
                "- Tránh sử dụng các từ ngữ nhạy cảm hoặc mang tính chẩn đoán như: \"trầm cảm\", \"rối loạn tâm thần\", \"nghiện nặng\", \"bệnh lý não\", trừ khi đang giải thích khái niệm chung một cách trung lập và mang tính giáo dục.\n\n" +
                "PHONG CÁCH TRẢ LỜI:\n" +
                "- Ngắn gọn, thân thiện, dễ hiểu.\n" +
                "- Tập trung vào giải pháp thực tế.\n" +
                "- Ưu tiên các bước hành động cụ thể.\n" +
                "- Không lan man sang chủ đề khác.\n" +
                "- Luôn giữ cuộc trò chuyện xoay quanh mục tiêu cải thiện sức khỏe số và quản lý dopamine."
        );

        // Nhúng context hint về nội dung gợi ý (nếu có) vào cuối system instruction
        String systemInstructionText = (contextHint != null && !contextHint.isBlank())
                ? baseInstruction + contextHint
                : baseInstruction;

        Map<String, Object> requestBody = Map.of(
            "contents", contents,
            "systemInstruction", Map.of(
                "parts", List.of(Map.of("text", systemInstructionText))
            )
        );

        return objectMapper.writeValueAsString(requestBody);
    }

    /**
     * Trích xuất text response từ Gemini API JSON response.
     */
    private String extractResponseText(String responseBody) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode textNode = rootNode.path("candidates").get(0)
                .path("content").path("parts").get(0)
                .path("text");
        return textNode.asText();
    }
}
