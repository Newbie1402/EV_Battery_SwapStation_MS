package com.boilerplate.bookingswap.controller;

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

import java.util.List;

/**
 * Controller xử lý các API liên quan đến UserPackageSubscription
 */
@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
@Slf4j
public class UserPackageSubscriptionController {

    private final UserPackageSubscriptionService subscriptionService;

    /**
     * Tạo đăng ký gói thuê pin mới
     */
    @PostMapping
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> createSubscription(
            @Valid @RequestBody UserPackageSubscriptionRequest requestDTO) {


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
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> getSubscriptionById(@PathVariable Long id) {
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
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> getActiveSubscription(
            @PathVariable String userId) {
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
    public ResponseEntity<ResponseData<Page<UserPackageSubscriptionResponse>>> getUserSubscriptionHistory(
            @PathVariable String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
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
    public ResponseEntity<ResponseData<UserSubscriptionStatsResponse>> getUserSubscriptionStats(
            @PathVariable String userId) {
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
    public ResponseEntity<ResponseData<String>> incrementUsedSwaps(@PathVariable Long id) {
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
    public ResponseEntity<ResponseData<UserPackageSubscriptionResponse>> cancelSubscription(@PathVariable Long id) {
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
     * Lấy danh sách đăng ký sắp hết hạn
     */
    @GetMapping("/expiring-soon")
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
     * Cập nhật trạng thái đăng ký hết hạn (Admin job)
     */
    @PostMapping("/update-expired")
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
     * Lấy danh sách đăng ký theo packagePlanId
     */
    @GetMapping("/package-plan/{packagePlanId}")
    public ResponseEntity<ResponseData<List<UserPackageSubscriptionResponse>>> getSubscriptionsByPackagePlanId(
            @PathVariable Long packagePlanId) {
        log.info("REST request to get subscriptions by packagePlanId: {}", packagePlanId);

        List<UserPackageSubscriptionResponse> response = subscriptionService.getSubscriptionsByPackagePlanId(packagePlanId);

        return ResponseEntity.ok(
                ResponseData.<List<UserPackageSubscriptionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách đăng ký theo gói thuê thành công")
                        .data(response)
                        .build()
        );
    }
}