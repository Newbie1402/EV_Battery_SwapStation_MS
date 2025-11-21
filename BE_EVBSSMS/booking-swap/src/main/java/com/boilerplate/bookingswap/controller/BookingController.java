package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.model.dto.request.BookingCancelRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingCompleteRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingSearchRequest;
import com.boilerplate.bookingswap.model.dto.request.BookingUpdateRequest;
import com.boilerplate.bookingswap.model.dto.respone.BookingResponse;
import com.boilerplate.bookingswap.model.dto.respone.BookingStatisticsResponse;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * Controller xử lý các API liên quan đến Booking
 */
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@Slf4j
public class BookingController {

    private final BookingService bookingService;

    /**
     * Tạo booking mới
     */
    @PostMapping("/create")
    public ResponseEntity<ResponseData<BookingResponse>> createBooking(
            @Valid @RequestBody BookingRequest requestDTO) {
        log.info("REST request to create booking for driver: {}", requestDTO.getDriverId());

        BookingResponse response = bookingService.createBooking(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tạo booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy tất cả booking với phân trang
     */
    @GetMapping("/getall")
    public ResponseEntity<ResponseData<Page<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get all bookings");

        Page<BookingResponse> response = bookingService.getAllBookings(page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin booking theo ID
     */
    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<BookingResponse>> getBookingById(@PathVariable Long id) {

        BookingResponse response = bookingService.getBookingById(id);

        return ResponseEntity.ok(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách booking của tài xế
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ResponseData<Page<BookingResponse>>> getDriverBookings(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get bookings for driver: {}", driverId);

        Page<BookingResponse> response = bookingService.getDriverBookings(driverId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách booking tại trạm
     */
    @GetMapping("/station/{stationId}")
    public ResponseEntity<ResponseData<Page<BookingResponse>>> getStationBookings(
            @PathVariable String stationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get bookings for station: {}", stationId);

        Page<BookingResponse> response = bookingService.getStationBookings(stationId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Tìm kiếm booking với nhiều điều kiện
     */
    @GetMapping("/search")
    public ResponseEntity<ResponseData<Page<BookingResponse>>> searchBookings(
            @ModelAttribute BookingSearchRequest searchDTO) {
        log.info("REST request to search bookings");

        Page<BookingResponse> response = bookingService.searchBookings(searchDTO);

        return ResponseEntity.ok(
                ResponseData.<Page<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Tìm kiếm booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Cập nhật booking
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseData<BookingResponse>> updateBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingUpdateRequest updateDTO) {
        log.info("REST request to update booking: {}", id);

        BookingResponse response = bookingService.updateBooking(id, updateDTO);

        return ResponseEntity.ok(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xác nhận booking
     */
    @PostMapping("/{id}/confirm")
    public ResponseEntity<ResponseData<BookingResponse>> confirmBooking(@PathVariable Long id) {
        log.info("REST request to confirm booking: {}", id);

        BookingResponse response = bookingService.confirmBooking(id);

        return ResponseEntity.ok(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xác nhận booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Hủy booking
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ResponseData<BookingResponse>> cancelBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingCancelRequest cancelDTO) {
        log.info("REST request to cancel booking: {}", id);

        BookingResponse response = bookingService.cancelBooking(id, cancelDTO.getCancelReason());

        return ResponseEntity.ok(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Hủy booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Hoàn thành booking
     */
    @PostMapping("/{id}/complete")
    public ResponseEntity<ResponseData<BookingResponse>> completeBooking(
            @PathVariable Long id,
            @Valid @RequestBody BookingCompleteRequest request) {
        log.info("REST request to complete booking: {}", id);

        BookingResponse response = bookingService.completeBooking(id, request.getPaymentId());

        return ResponseEntity.ok(
                ResponseData.<BookingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Hoàn thành booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy booking sắp diễn ra (trong 24h tới)
     */
    @GetMapping("/upcoming")
    public ResponseEntity<ResponseData<List<BookingResponse>>> getUpcomingBookings() {
        log.info("REST request to get upcoming bookings");

        List<BookingResponse> response = bookingService.getUpcomingBookings();

        return ResponseEntity.ok(
                ResponseData.<List<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách booking sắp diễn ra thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy booking quá hạn
     */
    @GetMapping("/overdue")
    public ResponseEntity<ResponseData<List<BookingResponse>>> getOverdueBookings() {
        log.info("REST request to get overdue bookings");

        List<BookingResponse> response = bookingService.getOverdueBookings();

        return ResponseEntity.ok(
                ResponseData.<List<BookingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách booking quá hạn thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Thống kê booking theo ngày
     */
    @GetMapping("/statistics")
    public ResponseEntity<ResponseData<BookingStatisticsResponse>> getBookingStatistics(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        log.info("REST request to get booking statistics for date: {}", date);

        BookingStatisticsResponse response = bookingService.getBookingStatistics(date);

        return ResponseEntity.ok(
                ResponseData.<BookingStatisticsResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thống kê booking thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xóa booking
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<String>> deleteBooking(@PathVariable Long id) {
        log.info("REST request to delete booking: {}", id);

        bookingService.deleteBooking(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xóa booking thành công")
                        .data("Đã xóa booking ID: " + id)
                        .build()
        );
    }

    @PutMapping("/confirmedIsPaid/{Id}")
    public ResponseEntity<ResponseData<Void>> confirmBookingIsPaid(
            @PathVariable Long Id){
        return bookingService.confirmIsPaid(Id);
    }

}

