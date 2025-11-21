package com.boilerplate.bookingswap.controller;

import com.boilerplate.bookingswap.model.dto.request.RatingRequest;
import com.boilerplate.bookingswap.model.dto.respone.RatingResponse;
import com.boilerplate.bookingswap.model.response.ResponseData;
import com.boilerplate.bookingswap.model.dto.respone.StationRatingStatsResponse;
import com.boilerplate.bookingswap.service.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controller xử lý các API liên quan đến Rating
 */
@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
@Slf4j
public class RatingController {

    private final RatingService ratingService;

    /**
     * Tạo đánh giá mới
     */
    @PostMapping
    public ResponseEntity<ResponseData<RatingResponse>> createRating(
            @Valid @RequestBody RatingRequest requestDTO) {
        log.info("REST request to create rating for station: {}", requestDTO.getStationId());

        RatingResponse response = ratingService.createRating(requestDTO);

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ResponseData.<RatingResponse>builder()
                        .statusCode(HttpStatus.CREATED.value())
                        .message("Tạo đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thông tin đánh giá theo ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ResponseData<RatingResponse>> getRatingById(@PathVariable Long id) {
        log.info("REST request to get rating: {}", id);

        RatingResponse response = ratingService.getRatingById(id);

        return ResponseEntity.ok(
                ResponseData.<RatingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thông tin đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách đánh giá của trạm
     */
    @GetMapping("/station/{stationId}")
    public ResponseEntity<ResponseData<Page<RatingResponse>>> getStationRatings(
            @PathVariable String stationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get ratings for station: {}", stationId);

        Page<RatingResponse> response = ratingService.getStationRatings(stationId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<RatingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy danh sách đánh giá của tài xế
     */
    @GetMapping("/driver/{driverId}")
    public ResponseEntity<ResponseData<Page<RatingResponse>>> getDriverRatings(
            @PathVariable String driverId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        log.info("REST request to get ratings by driver: {}", driverId);

        Page<RatingResponse> response = ratingService.getDriverRatings(driverId, page, size);

        return ResponseEntity.ok(
                ResponseData.<Page<RatingResponse>>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy danh sách đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy thống kê đánh giá của trạm
     */
    @GetMapping("/station/{stationId}/stats")
    public ResponseEntity<ResponseData<StationRatingStatsResponse>> getStationRatingStats(
            @PathVariable String stationId) {
        log.info("REST request to get rating stats for station: {}", stationId);

        StationRatingStatsResponse response = ratingService.getStationRatingStats(stationId);

        return ResponseEntity.ok(
                ResponseData.<StationRatingStatsResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy thống kê đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Xóa đánh giá
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ResponseData<String>> deleteRating(@PathVariable Long id) {
        log.info("REST request to delete rating: {}", id);

        ratingService.deleteRating(id);

        return ResponseEntity.ok(
                ResponseData.<String>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Xóa đánh giá thành công")
                        .data("Đã xóa đánh giá ID: " + id)
                        .build()
        );
    }

    /**
     * Cập nhật đánh giá theo ID (chỉ sửa score & comment)
     */
    @PatchMapping("/{id}")
    public ResponseEntity<ResponseData<RatingResponse>> updateRating(
            @PathVariable Long id,
            @Valid @RequestBody RatingRequest requestDTO) {
        log.info("REST request to update rating: {}", id);

        RatingResponse response = ratingService.updateRating(id, requestDTO);

        return ResponseEntity.ok(
                ResponseData.<RatingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Cập nhật đánh giá thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Lấy đánh giá theo bookingId
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ResponseData<RatingResponse>> getRatingByBookingId(@PathVariable String bookingId) {
        log.info("REST request to get rating by bookingId: {}", bookingId);

        RatingResponse response = ratingService.getRatingByBookingId(bookingId);

        return ResponseEntity.ok(
                ResponseData.<RatingResponse>builder()
                        .statusCode(HttpStatus.OK.value())
                        .message("Lấy đánh giá theo bookingId thành công")
                        .data(response)
                        .build()
        );
    }
}