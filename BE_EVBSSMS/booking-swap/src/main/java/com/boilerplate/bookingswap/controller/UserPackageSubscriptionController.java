package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import com.boilerplate.bookingswap.model.dto.request.UserPackageSubscriptionRequest;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.model.dto.respone.UserPackageSubscriptionResponse;
import com.boilerplate.bookingswap.model.dto.respone.UserSubscriptionStatsResponse;
import com.boilerplate.bookingswap.service.UserPackageSubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * Controller xử lý các API liên quan đến UserPackageSubscription
 */
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Package Subscription", description = "API quản lý đăng ký gói thuê pin của người dùng: tạo, lịch sử, thống kê, cập nhật trạng thái, bật/tắt gia hạn tự động")
public class UserPackageSubscriptionController {

    private final UserPackageSubscriptionService subscriptionService;

    /**
     * Tạo đăng ký gói thuê pin mới
     */
    @PostMapping
    @Operation(summary = "Tạo đăng ký mới", description = "Tạo một đăng ký gói thuê pin cho người dùng nếu chưa có gói ACTIVE", responses = {
            @ApiResponse(responseCode = "201", description = "Tạo thành công", content = @Content(schema = @Schema(implementation = UserPackageSubscriptionResponse.class))),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> createSubscription(
            @Valid @RequestBody @Parameter(description = "Thông tin đăng ký gói thuê pin") UserPackageSubscriptionRequest requestDTO) {
        log.info("REST request to create subscription for user: {}", requestDTO.getUserId());

        UserPackageSubscriptionResponse response = subscriptionService.createSubscription(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Đăng ký gói thuê pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin đăng ký theo ID
     */
    @GetMapping("/{id}")
    @Operation(summary = "Lấy đăng ký theo ID", description = "Trả về thông tin chi tiết của một đăng ký theo ID")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> getSubscriptionById(
            @PathVariable @Parameter(description = "ID đăng ký") Long id) {
        log.info("REST request to get subscription: {}", id);

        UserPackageSubscriptionResponse response = subscriptionService.getSubscriptionById(id);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin đăng ký thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy đăng ký đang hoạt động của user
     */
    @GetMapping("/user/{userId}/active")
    @Operation(summary = "Lấy đăng ký ACTIVE", description = "Lấy đăng ký đang hoạt động của người dùng nếu còn hiệu lực")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> getActiveSubscription(
            @PathVariable @Parameter(description = "ID người dùng") String userId) {
        log.info("REST request to get active subscription for user: {}", userId);

        UserPackageSubscriptionResponse response = subscriptionService.getActiveSubscription(userId);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy đăng ký đang hoạt động thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy lịch sử đăng ký của user
     */
    @GetMapping("/user/{userId}/history")
    @Operation(summary = "Lấy lịch sử đăng ký", description = "Phân trang danh sách các đăng ký của người dùng (mọi trạng thái)")
    public ResponseEntity<ResponseData<Page<UserPackageSubscriptionResponse>>> getUserSubscriptionHistory(
            @PathVariable @Parameter(description = "ID người dùng") String userId,
            @RequestParam(defaultValue = "0") @Parameter(description = "Trang hiện tại") int page,
            @RequestParam(defaultValue = "10") @Parameter(description = "Kích thước trang") int size) {
        log.info("REST request to get subscription history for user: {}", userId);

        Page<UserPackageSubscriptionResponse> response = subscriptionService.getUserSubscriptionHistory(userId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<UserPackageSubscriptionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy lịch sử đăng ký thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thống kê đăng ký của user
     */
    @GetMapping("/user/{userId}/stats")
    @Operation(summary = "Thống kê đăng ký", description = "Trả về thống kê lượt sử dụng, lượt còn lại, số ngày còn lại và thông tin gói")
    public ResponseEntity<ResponseData<UserSubscriptionStatsResponse>> getUserSubscriptionStats(
            @PathVariable @Parameter(description = "ID người dùng") String userId) {
        log.info("REST request to get subscription stats for user: {}", userId);

        UserSubscriptionStatsResponse response = subscriptionService.getUserSubscriptionStats(userId);

        return ResponseEntity.ok(
                ResponseData.<UserSubscriptionStatsResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thống kê đăng ký thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Tăng số lần sử dụng đổi pin
     */
    @PostMapping("/{id}/increment-swaps")
    @Operation(summary = "Tăng số lần sử dụng", description = "Tăng bộ đếm usedSwaps nếu chưa vượt quá giới hạn gói")
    public ResponseEntity<ResponseData<String>> incrementUsedSwaps(
            @PathVariable @Parameter(description = "ID đăng ký") Long id) {
        log.info("REST request to increment used swaps for subscription: {}", id);

        subscriptionService.incrementUsedSwaps(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Tăng số lần sử dụng thành công")
                        .data("Đã tăng số lần sử dụng cho subscription ID: " + id)
                        .build()
        );
    }

    /**
     * Hủy đăng ký
     */
    @PostMapping("/{id}/cancel")
    @Operation(summary = "Hủy đăng ký", description = "Chuyển trạng thái từ ACTIVE sang INACTIVE")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> cancelSubscription(
            @PathVariable @Parameter(description = "ID đăng ký") Long id) {
        log.info("REST request to cancel subscription: {}", id);

        UserPackageSubscriptionResponse response = subscriptionService.cancelSubscription(id);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Hủy đăng ký thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách đăng ký sắp hết hạn (trong 7 ngày)
     */
    @GetMapping("/expiring-soon")
    @Operation(summary = "Danh sách sắp hết hạn", description = "Liệt kê các subscription ACTIVE có endDate trong 7 ngày tới")
    public ResponseEntity<ResponseData<List<UserPackageSubscriptionResponse>>> getExpiringSoonSubscriptions() {
        log.info("REST request to get expiring soon subscriptions");

        List<UserPackageSubscriptionResponse> response = subscriptionService.getExpiringSoonSubscriptions();

        return ResponseEntity.ok(
                ResponseData.<List<UserPackageSubscriptionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách đăng ký sắp hết hạn thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Cập nhật trạng thái đăng ký hết hạn (Admin job thủ công)
     */
    @PostMapping("/update-expired")
    @Operation(summary = "Cập nhật hết hạn", description = "Quét và chuyển các subscription đã quá hạn (endDate < now) sang EXPIRED")
    public ResponseEntity<ResponseData<String>> updateExpiredSubscriptions() {
        log.info("REST request to update expired subscriptions");

        subscriptionService.updateExpiredSubscriptions();

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật đăng ký hết hạn thành công")
                        .data("Đã cập nhật các đăng ký hết hạn")
                        .build()
        );
    }

    /**
     * Cập nhật trạng thái thủ công
     */
    @PatchMapping("/{id}/status")
    @Operation(summary = "Cập nhật trạng thái thủ công", description = "Cho phép ADMIN cập nhật trạng thái tùy ý (ACTIVE/INACTIVE/EXPIRED)")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> updateStatus(
            @PathVariable @Parameter(description = "ID đăng ký") Long id,
            @RequestParam @Parameter(description = "Trạng thái mới") SubscriptionStatus status) {
        log.info("REST request to update status manually for subscription: {} -> {}", id, status);

        UserPackageSubscriptionResponse response = subscriptionService.updateStatusManually(id, status);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật trạng thái thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Bật / tắt tự động gia hạn
     */
    @PatchMapping("/{id}/auto-extend")
    @Operation(summary = "Cập nhật tự động gia hạn", description = "Bật hoặc tắt cơ chế tự động gia hạn subscription khi hết hạn")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> toggleAutoExtend(
            @PathVariable @Parameter(description = "ID đăng ký") Long id,
            @RequestParam @Parameter(description = "true = bật, false = tắt") boolean autoExtend) {
        log.info("REST request to toggle auto-extend for subscription: {} -> {}", id, autoExtend);

        UserPackageSubscriptionResponse response = subscriptionService.toggleAutoExtend(id, autoExtend);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật auto-extend thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Gia hạn endDate dựa trên packageType (MONTHLY/YEARLY)
     */
    @PatchMapping("/{id}/extend")
    @Operation(summary = "Gia hạn endDate", description = "Gia hạn endDate theo loại gói. Nếu còn hiệu lực sẽ gia hạn từ endDate hiện tại, nếu hết hạn sẽ gia hạn từ thời điểm hiện tại. periods mặc định = 1.")
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> extendEndDate(
            @PathVariable @Parameter(description = "ID đăng ký") Long id,
            @RequestParam(name = "periods", defaultValue = "1") @Parameter(description = "Số chu kỳ cần gia hạn (tháng/năm)") int periods) {
        log.info("REST request to extend endDate for subscription: {} with periods: {}", id, periods);

        UserPackageSubscriptionResponse response = subscriptionService.extendEndDate(id, periods);

        return ResponseEntity.ok(
                ResponseData.<UserPackageSubscriptionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Gia hạn endDate thành công")
                        .data(response)
                        .build()
        );
    }
}