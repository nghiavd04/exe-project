package com.product.exe.backend.service.impl;

import com.product.exe.backend.dto.response.SuggestionItem;
import com.product.exe.backend.entity.Article;
import com.product.exe.backend.entity.Quiz;
import com.product.exe.backend.enums.ArticleStatus;
import com.product.exe.backend.enums.QuizStatus;
import com.product.exe.backend.repository.ArticleRepository;
import com.product.exe.backend.repository.QuizRepository;
import com.product.exe.backend.service.ContentSuggestionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ContentSuggestionServiceImpl implements ContentSuggestionService {

    private final ArticleRepository articleRepository;
    private final QuizRepository quizRepository;

    /**
     * Danh sách stop-words tiếng Việt và tiếng Anh phổ biến cần loại bỏ khi trích xuất keyword.
     */
    private static final Set<String> STOP_WORDS = new HashSet<>(Arrays.asList(
            // Tiếng Việt
            "tôi", "bạn", "mình", "chúng", "ta", "họ", "nó", "này", "đó", "kia",
            "và", "hoặc", "hay", "nhưng", "mà", "vì", "nên", "thì", "là", "của",
            "để", "cho", "với", "từ", "trong", "ngoài", "trên", "dưới", "về",
            "có", "không", "được", "bị", "hãy", "đã", "sẽ", "đang", "cũng", "rất",
            "muốn", "biết", "hiểu", "xem", "làm", "nói", "hỏi", "trả", "lời",
            "như", "thế", "nào", "gì", "ở", "ai", "khi", "nếu", "thì", "mấy",
            "nhiều", "ít", "hơn", "nhất", "lắm", "quá", "thêm", "chỉ", "đến",
            // Tiếng Anh phổ biến
            "i", "me", "you", "we", "they", "it", "is", "are", "was", "were",
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "about", "what", "how", "why", "when", "where", "which",
            "do", "does", "did", "have", "has", "can", "could", "will", "would", "should",
            "tell", "know", "help", "please", "want", "need", "give", "some", "more"
    ));

    @Override
    public List<SuggestionItem> findSuggestions(String userMessage, int maxItems) {
        if (userMessage == null || userMessage.isBlank()) {
            return Collections.emptyList();
        }

        List<String> keywords = extractKeywords(userMessage);
        if (keywords.isEmpty()) {
            return Collections.emptyList();
        }

        log.debug("AI suggestion keywords extracted: {}", keywords);

        // Dùng LinkedHashMap để tránh trùng lặp, giữ thứ tự insert
        Map<String, SuggestionItem> suggestionMap = new LinkedHashMap<>();

        int perKeywordLimit = Math.max(1, maxItems / keywords.size());

        for (String keyword : keywords) {
            if (suggestionMap.size() >= maxItems) break;

            // Tìm bài viết liên quan
            List<Article> articles = articleRepository.findTopByKeyword(
                    keyword, ArticleStatus.PUBLISHED, PageRequest.of(0, perKeywordLimit)
            );
            for (Article article : articles) {
                if (suggestionMap.size() >= maxItems) break;
                String key = "ARTICLE-" + article.getId();
                if (!suggestionMap.containsKey(key)) {
                    suggestionMap.put(key, SuggestionItem.builder()
                            .type("ARTICLE")
                            .id(article.getId())
                            .title(article.getTitle())
                            .slug(article.getSlug())
                            .thumbnailUrl(article.getThumbnailUrl())
                            .build());
                }
            }

            // Tìm bài kiểm tra liên quan
            List<Quiz> quizzes = quizRepository.findTopByKeyword(
                    keyword, QuizStatus.PUBLISHED, PageRequest.of(0, perKeywordLimit)
            );
            for (Quiz quiz : quizzes) {
                if (suggestionMap.size() >= maxItems) break;
                String key = "QUIZ-" + quiz.getId();
                if (!suggestionMap.containsKey(key)) {
                    suggestionMap.put(key, SuggestionItem.builder()
                            .type("QUIZ")
                            .id(quiz.getId())
                            .title(quiz.getTitle())
                            .slug(null)
                            .thumbnailUrl(quiz.getImageUrl())
                            .build());
                }
            }
        }

        return new ArrayList<>(suggestionMap.values());
    }

    @Override
    public String formatContextHint(List<SuggestionItem> suggestions) {
        if (suggestions == null || suggestions.isEmpty()) {
            return "";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("\n\n---\n");
        sb.append("NỘI DUNG LIÊN QUAN TRONG HỆ THỐNG DOPALESS:\n");
        for (SuggestionItem item : suggestions) {
            if ("ARTICLE".equals(item.getType())) {
                sb.append(String.format("- [Bài viết] \"%s\" (slug: %s)\n", item.getTitle(), item.getSlug()));
            } else if ("QUIZ".equals(item.getType())) {
                sb.append(String.format("- [Bài kiểm tra] \"%s\" (id: %d)\n", item.getTitle(), item.getId()));
            }
        }
        sb.append("Nếu nội dung trả lời liên quan đến các tài nguyên trên, hãy tự nhiên đề cập và khuyến khích người dùng tham khảo.\n");
        sb.append("---");

        return sb.toString();
    }

    /**
     * Trích xuất keywords có ý nghĩa từ tin nhắn của người dùng.
     * Loại bỏ stop-words và các từ quá ngắn (< 3 ký tự).
     */
    private List<String> extractKeywords(String message) {
        String normalized = message.toLowerCase()
                .replaceAll("[^a-zA-ZÀ-ỹà-ỹ\\s]", " ") // Loại bỏ ký tự đặc biệt, số
                .replaceAll("\\s+", " ")
                .trim();

        String[] tokens = normalized.split("\\s+");

        return Arrays.stream(tokens)
                .filter(token -> token.length() >= 3)
                .filter(token -> !STOP_WORDS.contains(token))
                .distinct()
                .limit(5) // Tối đa 5 keyword để tránh quá nhiều DB query
                .collect(Collectors.toList());
    }
}
