package com.product.exe.backend.controller.customer;
import com.product.exe.backend.dto.request.UserDailyLogRequest;
import com.product.exe.backend.dto.request.UserWeeklyLogRequest;
import com.product.exe.backend.dto.request.ProgramReviewRequest;
import com.product.exe.backend.dto.response.*;
import com.product.exe.backend.entity.User;
import com.product.exe.backend.enums.SubscriptionTier;
import com.product.exe.backend.exception.BadRequestException;
import com.product.exe.backend.repository.UserRepository;
import com.product.exe.backend.service.ProgramService;
import com.product.exe.backend.service.SubscriptionService;
import com.product.exe.backend.service.ProtocolService;
import com.product.exe.backend.entity.Protocol;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/customer/program")
@RequiredArgsConstructor
public class CustomerProgramController {

    private final ProgramService programService;
    private final UserRepository userRepository;
    private final SubscriptionService subscriptionService;
    private final ProtocolService protocolService;

    private Long getUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông tin người dùng"));
    }

    private void checkProgramAccess(Authentication authentication) {
        Long userId = getUserId(authentication);
        SubscriptionTier tier = subscriptionService.getUserHighestTier(userId);
        if (!isTierAllowedForProgram(tier)) {
            throw new BadRequestException("Gói dịch vụ hiện tại của bạn không hỗ trợ truy cập tính năng phác đồ. Vui lòng đăng ký gói phù hợp.");
        }
    }

    private boolean isTierAllowedForProgram(SubscriptionTier tier) {
        if (tier == null) {
            return false;
        }
        // Gói FREE không được phép truy cập phác đồ. Các gói khác (BASIC, PREMIUM, ELITE) được truy cập.
        return tier != SubscriptionTier.FREE;
    }

    @PostMapping("/select-protocol")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> selectProtocol(
            @RequestParam Long protocolId,
            Authentication authentication) {
        Long userId = getUserId(authentication);
        programService.selectProtocol(userId, protocolId);
        return ResponseEntity.ok(ApiResponse.success("Chọn phác đồ thành công", "Thành công"));
    }

    @PostMapping("/enroll")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> enroll(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký phác đồ thành công", programService.enroll(userId)));
    }

    @GetMapping("/progress")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> getProgress(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tiến trình thành công", programService.getProgress(userId)));
    }

    @GetMapping("/day/{dayNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramDayDetailResponse>> getDayDetail(
            Authentication authentication,
            @PathVariable Integer dayNumber) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết ngày thành công", programService.getDayDetail(userId, dayNumber)));
    }

    @GetMapping("/week/{weekNumber}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramWeekDetailResponse>> getWeekDetail(
            Authentication authentication,
            @PathVariable Integer weekNumber) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết tuần thành công", programService.getWeekDetail(userId, weekNumber)));
    }

    @PostMapping("/toggle-task")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> toggleTask(
            Authentication authentication,
            @RequestParam(required = false) Integer dayNumber,
            @RequestParam Integer weekNumber,
            @RequestParam Integer taskIndex,
            @RequestParam Boolean isCompleted) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        programService.toggleTask(userId, dayNumber, weekNumber, taskIndex, isCompleted);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật nhiệm vụ thành công", "Thành công"));
    }

    @PostMapping("/day/{dayNumber}/log")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> saveDailyLog(
            Authentication authentication,
            @PathVariable Integer dayNumber,
            @RequestBody UserDailyLogRequest request) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        programService.saveDailyLog(userId, dayNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận chỉ số ngày thành công", "Thành công"));
    }

    @PostMapping("/week/{weekNumber}/log")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<String>> saveWeeklyLog(
            Authentication authentication,
            @PathVariable Integer weekNumber,
            @RequestBody UserWeeklyLogRequest request) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        programService.saveWeeklyLog(userId, weekNumber, request);
        return ResponseEntity.ok(ApiResponse.success("Ghi nhận chỉ số tuần thành công", "Thành công"));
    }

    @GetMapping("/analytics")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramAnalyticsResponse>> getAnalytics(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy chỉ số phân tích thành công", programService.getAnalytics(userId)));
    }

    @PostMapping("/advance-day")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> advanceDay(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đã tiến sang ngày tiếp theo thành công", programService.advanceDayForUser(userId)));
    }

    @GetMapping("/metadata")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramMetadataResponse>> getMetadata(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy cấu trúc lộ trình thành công", programService.getProgramMetadataForUser(userId)));
    }

    @PostMapping("/resume")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> resumeProgram(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đã tiếp tục lộ trình phác đồ thành công", programService.resumeProgram(userId)));
    }

    @PostMapping("/restart")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> restartProgram(Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đã bắt đầu lại lộ trình phác đồ thành công", programService.restartProgram(userId)));
    }

    @PostMapping("/review")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProgramProgressResponse>> submitReview(
            @RequestBody ProgramReviewRequest request,
            Authentication authentication) {
        checkProgramAccess(authentication);
        Long userId = getUserId(authentication);
        return ResponseEntity.ok(ApiResponse.success("Đã gửi đánh giá thành công", programService.submitReview(userId, request)));
    }

    @GetMapping("/protocols")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<Protocol>>> getActiveProtocols(Authentication authentication) {
        checkProgramAccess(authentication);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phác đồ hoạt động thành công", protocolService.getActiveProtocols()));
    }
}
