package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.model.dto.request.BatterySwapTransactionRequest;
import com.boilerplate.bookingswap.model.dto.respone.BatterySwapTransactionResponse;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.service.BatterySwapTransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * Controller xử lý các API liên quan đến BatterySwapTransaction
 */
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
@Slf4j
public class BatterySwapTransactionController {

    private final BatterySwapTransactionService transactionService;

    /**
     * Tạo giao dịch đổi pin mới
     */
    @PostMapping
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> createTransaction(
            @Valid @RequestBody BatterySwapTransactionRequest requestDTO) {
        log.info("REST request to create transaction for booking: {}", requestDTO.getBookingId());

        BatterySwapTransactionResponse response = transactionService.createTransaction(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tạo giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin giao dịch theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> getTransactionById(@PathVariable Long id) {
        log.info("REST request to get transaction: {}", id);

        BatterySwapTransactionResponse response = transactionService.getTransactionById(id);

        return ResponseEntity.ok(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy giao dịch theo booking ID
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> getTransactionByBookingId(
            @PathVariable String bookingId) {
        log.info("REST request to get transaction by booking: {}", bookingId);

        BatterySwapTransactionResponse response = transactionService.getTransactionByBookingId(bookingId);

        return ResponseEntity.ok(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách giao dịch của tài xế
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ResponseData<Page<BatterySwapTransactionResponse>>> getDriverTransactions(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get transactions for driver: {}", driverId);

        Page<BatterySwapTransactionResponse> response = transactionService.getDriverTransactions(driverId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<BatterySwapTransactionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách giao dịch tại trạm
     */
    @GetMapping("/station/{stationId}")
    public ResponseEntity<ResponseData<Page<BatterySwapTransactionResponse>>> getStationTransactions(
            @PathVariable String stationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get transactions for station: {}", stationId);

        Page<BatterySwapTransactionResponse> response = transactionService.getStationTransactions(stationId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<BatterySwapTransactionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xử lý giao dịch
     */
    @PostMapping("/{id}/process")
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> processTransaction(@PathVariable Long id) {
        log.info("REST request to process transaction: {}", id);

        BatterySwapTransactionResponse response = transactionService.processTransaction(id);

        return ResponseEntity.ok(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xử lý giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Hoàn thành giao dịch
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> completeTransaction(@PathVariable Long id) {
        log.info("REST request to complete transaction: {}", id);

        BatterySwapTransactionResponse response = transactionService.completeTransaction(id);

        return ResponseEntity.ok(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Hoàn thành giao dịch thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Đánh dấu giao dịch thất bại
     */
    @PostMapping("/{id}/fail")
    public ResponseEntity<ResponseData<BatterySwapTransactionResponse>> failTransaction(@PathVariable Long id) {
        log.info("REST request to fail transaction: {}", id);

        BatterySwapTransactionResponse response = transactionService.failTransaction(id);

        return ResponseEntity.ok(
                ResponseData.<BatterySwapTransactionResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Đã đánh dấu giao dịch thất bại")
                        .data(response)
                        .build()
        );
    }

    /**
     * Tính tổng chi tiêu của tài xế
     */
    @GetMapping("/driver/{driverId}/total-spending")
    public ResponseEntity<ResponseData<BigDecimal>> calculateDriverTotalSpending(@PathVariable String driverId) {
        log.info("REST request to calculate total spending for driver: {}", driverId);

        BigDecimal total = transactionService.calculateDriverTotalSpending(driverId);

        return ResponseEntity.ok(
                ResponseData.<BigDecimal>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Tính tổng chi tiêu thành công")
                        .data(total)
                        .build()
        );
    }

    /**
     * Tính tổng doanh thu của trạm
     */
    @GetMapping("/station/{stationId}/revenue")
    public ResponseEntity<ResponseData<BigDecimal>> calculateStationRevenue(@PathVariable String stationId) {
        log.info("REST request to calculate revenue for station: {}", stationId);

        BigDecimal revenue = transactionService.calculateStationRevenue(stationId);

        return ResponseEntity.ok(
                ResponseData.<BigDecimal>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Tính tổng doanh thu thành công")
                        .data(revenue)
                        .build()
        );
    }

    /**
     * Lấy lịch sử đổi pin của battery
     */
    @GetMapping("/battery/{batteryId}/history")
    public ResponseEntity<ResponseData<List<BatterySwapTransactionResponse>>> getBatterySwapHistory(
            @PathVariable String batteryId) {
        log.info("REST request to get battery swap history: {}", batteryId);

        List<BatterySwapTransactionResponse> response = transactionService.getBatterySwapHistory(batteryId);

        return ResponseEntity.ok(
                ResponseData.<List<BatterySwapTransactionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy lịch sử đổi pin thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy giao dịch bị kẹt
     */
    @GetMapping("/stuck")
    public ResponseEntity<ResponseData<List<BatterySwapTransactionResponse>>> getStuckTransactions() {
        log.info("REST request to get stuck transactions");

        List<BatterySwapTransactionResponse> response = transactionService.getStuckTransactions();

        return ResponseEntity.ok(
                ResponseData.<List<BatterySwapTransactionResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách giao dịch bị kẹt thành công")
                        .data(response)
                        .build()
        );
    }
}

