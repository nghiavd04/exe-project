package com.product.exe.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.product.exe.backend.entity.ChatMessage;
import com.product.exe.backend.service.GeminiService;
import com.product.exe.backend.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
@RequiredArgsConstructor
public class GeminiServiceImpl implements GeminiService {

    private final SystemConfigService systemConfigService;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.model:}")
    private String model;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    public String getChatResponse(List<ChatMessage> history, String userPrompt) {
        try {
            if (apiKey == null || apiKey.isBlank() || apiKey.contains("PlaceholderKey")) {
                log.warn("Gemini API Key is not configured or is placeholder. Returning mock response.");
                return "Xin chào! Tôi là Trợ lý AI của bạn. Hiện tại hệ thống đang gặp sự cố. Vui lòng thử lại sau!";
            }

            String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

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
            String systemInstructionText = systemConfigService.getOrSetDefaultValue(
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

            Map<String, Object> requestBody = Map.of(
                "contents", contents,
                "systemInstruction", Map.of(
                    "parts", List.of(Map.of("text", systemInstructionText))
                )
            );
            
            String jsonPayload = objectMapper.writeValueAsString(requestBody);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini API call failed with status: {}, response: {}", response.statusCode(), response.body());
                if (response.body().contains("API key not valid")) {
                    return "Khóa API Gemini của hệ thống không hợp lệ. Vui lòng kiểm tra lại cấu hình tệp .env ở backend!";
                }
                return "Đã xảy ra lỗi khi trao đổi với AI (Mã lỗi: " + response.statusCode() + "). Vui lòng thử lại sau!";
            }

            JsonNode rootNode = objectMapper.readTree(response.body());
            JsonNode textNode = rootNode.path("candidates").get(0)
                    .path("content").path("parts").get(0)
                    .path("text");

            return textNode.asText();

        } catch (Exception e) {
            log.error("Error communicating with Gemini API", e);
            return "Không thể kết nối với dịch vụ AI. Lỗi: " + e.getMessage();
        }
    }
}
