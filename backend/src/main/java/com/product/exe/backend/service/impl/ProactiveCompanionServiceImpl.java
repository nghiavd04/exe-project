package com.product.exe.backend.service.impl;

import com.product.exe.backend.entity.*;
import com.product.exe.backend.enums.ChatSessionType;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.repository.*;
import com.product.exe.backend.service.GeminiService;
import com.product.exe.backend.service.NotificationService;
import com.product.exe.backend.service.ProactiveCompanionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProactiveCompanionServiceImpl implements ProactiveCompanionService {

    private final CustomerRepository customerRepository;
    private final UserProgramTaskRepository userProgramTaskRepository;
    private final UserDailyLogRepository userDailyLogRepository;
    private final UserSubscriptionRepository userSubscriptionRepository;
    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final GeminiService geminiService;
    private final NotificationService notificationService;

    @Override
    public void evaluateAndRemindCustomer(Long customerId, Integer currentDay) {
        Customer customer = customerRepository.findById(customerId).orElse(null);
        if (customer == null || customer.getUser() == null) {
            log.warn("Customer not found for ID: {}", customerId);
            return;
        }
        User user = customer.getUser();

        // 0. Check Subscription Tier
        Optional<UserSubscription> activeSubOpt = userSubscriptionRepository.findActiveSubscriptionByUserId(user.getId());
        if (activeSubOpt.isEmpty()) {
            log.info("Customer {} has no active subscription. Skipping proactive reminder.", customerId);
            return;
        }
        SubscriptionTier tier = activeSubOpt.get().getTier();

        if (tier == SubscriptionTier.FREE) {
            log.info("Customer {} is on FREE tier. Skipping proactive reminder.", customerId);
            return;
        }

        // 1. Check if there are any pending tasks for today
        List<UserProgramTask> todayTasks = userProgramTaskRepository.findByCustomerIdAndDayNumber(customerId, currentDay);
        List<UserProgramTask> pendingTasks = todayTasks.stream()
                .filter(task -> !task.getIsCompleted())
                .collect(Collectors.toList());

        if (pendingTasks.isEmpty()) {
            log.info("Customer {} has no pending tasks for day {}. No proactive reminder needed.", customerId, currentDay);
            return;
        }

        // 2. Route based on Subscription Tier
        if (tier == SubscriptionTier.BASIC) {
            // Basic users get standard push notification without AI
            notificationService.createNotification(user, "Nhắc nhở từ Dopaless", "Bạn ơi, hôm nay còn " + pendingTasks.size() + " nhiệm vụ chưa hoàn thành. Hãy vào ứng dụng để tiếp tục nhé!");
            log.info("Sent BASIC notification reminder to Customer {}", customerId);
            return;
        }

        // PREMIUM and ELITE users get AI-generated chat messages
        generateAndSendAiMessage(customer, pendingTasks);
    }

    private void generateAndSendAiMessage(Customer customer, List<UserProgramTask> pendingTasks) {
        User user = customer.getUser();
        Long customerId = customer.getId();

        // Fetch past 7 days statistics
        List<UserDailyLog> logs = userDailyLogRepository.findByCustomerIdOrderByDayNumberAsc(customerId);
        int startIndex = Math.max(0, logs.size() - 7);
        List<UserDailyLog> last7DaysLogs = logs.subList(startIndex, logs.size());

        double avgScreenTime = last7DaysLogs.stream().mapToInt(l -> l.getScreenTimeMinutes() != null ? l.getScreenTimeMinutes() : 0).average().orElse(0);
        double avgMood = last7DaysLogs.stream().mapToInt(l -> l.getMoodScore() != null ? l.getMoodScore() : 0).average().orElse(0);

        long totalTasksCompleted = userProgramTaskRepository.countByCustomerIdAndIsCompletedTrue(customerId);

        String userName = customer.getFullName() != null ? customer.getFullName() : user.getEmail().split("@")[0];

        String contextHint = "YÊU CẦU ĐẶC BIỆT: Bạn đang chủ động gửi tin nhắn hỏi thăm người dùng (không đợi họ hỏi). " +
                "Người dùng tên là " + userName + ". Hôm nay họ chưa hoàn thành " + pendingTasks.size() + " nhiệm vụ (task). " +
                "Thống kê 7 ngày qua của họ: Trung bình dùng màn hình " + String.format("%.0f", avgScreenTime) + " phút/ngày, " +
                "Tâm trạng trung bình: " + String.format("%.1f", avgMood) + "/10. Tổng số task đã hoàn thành từ trước đến nay: " + totalTasksCompleted + ". " +
                "Hãy viết 1 tin nhắn (ngắn dưới 40 từ), xưng hô thân mật, dùng emoji, không trách móc, động viên họ hoàn thành task hôm nay. Giống như bạn đang chủ động nhắn tin chat với họ.";

        String aiMessage = geminiService.getChatResponse(Collections.emptyList(), "Viết lời nhắc nhở cho " + userName, contextHint);

        if (aiMessage != null && !aiMessage.isBlank()) {
            // Save to ChatMessage
            ChatSession aiSession = chatSessionRepository.findFirstByUserIdAndSessionType(user.getId(), ChatSessionType.AI).orElseGet(() -> {
                ChatSession newSession = ChatSession.builder()
                        .user(user)
                        .title("Trò chuyện với Dopaless AI")
                        .sessionType(ChatSessionType.AI)
                        .build();
                return chatSessionRepository.save(newSession);
            });

            ChatMessage chatMessage = ChatMessage.builder()
                    .session(aiSession)
                    .role("model")
                    .content(aiMessage)
                    .isRead(false)
                    .build();
            chatMessageRepository.save(chatMessage);

            // Send a quick push notification to notify about the message
            notificationService.createNotification(user, "Dopaless AI", "AI vừa nhắn tin hỏi thăm bạn kìa, hãy kiểm tra tin nhắn nhé! \uD83D\uDCAC");
            log.info("Saved proactive AI chat message for PREMIUM Customer {}: {}", customerId, aiMessage);
        } else {
            log.warn("Failed to generate AI message for PREMIUM Customer {}", customerId);
        }
    }
}
