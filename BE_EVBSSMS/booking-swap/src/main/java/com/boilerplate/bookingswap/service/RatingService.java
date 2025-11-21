package com.boilerplate.bookingswap.service;

import com.boilerplate.bookingswap.exception.NotFoundException;
import com.boilerplate.bookingswap.model.entity.Rating;
import com.boilerplate.bookingswap.model.dto.request.RatingRequest;
import com.boilerplate.bookingswap.model.dto.respone.RatingResponse;
import com.boilerplate.bookingswap.model.dto.respone.StationRatingStatsResponse;
import com.boilerplate.bookingswap.repository.RatingRepository;
import com.boilerplate.bookingswap.service.mapper.RatingMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service xử lý business logic cho Rating
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RatingService {

    private final RatingRepository ratingRepository;
    private final RatingMapper ratingMapper;

    /**
     * Tạo đánh giá mới
     */
    @Transactional
    public RatingResponse createRating(RatingRequest requestDTO) {
        log.info("Tạo đánh giá mới cho trạm: {}", requestDTO.getStationId());

        // Kiểm tra đã đánh giá booking này chưa
        if (requestDTO.getBookingId() != null &&
                ratingRepository.existsByBookingIdAndDriverId(requestDTO.getBookingId(), requestDTO.getDriverId())) {
            throw new IllegalStateException("Booking này đã được đánh giá");
        }

        Rating rating = ratingMapper.toEntity(requestDTO);
        Rating savedRating = ratingRepository.save(rating);

        log.info("Đã tạo đánh giá ID: {} cho trạm: {}", savedRating.getId(), savedRating.getStationId());

        return ratingMapper.toResponseDTO(savedRating);
    }

    /**
     * Lấy thông tin đánh giá theo ID
     */
    public RatingResponse getRatingById(Long id) {
        log.debug("Lấy thông tin đánh giá ID: {}", id);

        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá với ID: " + id));

        return ratingMapper.toResponseDTO(rating);
    }

    /**
     * Lấy tất cả đánh giá của trạm
     */
    public Page<RatingResponse> getStationRatings(String stationId, int page, int size) {
        log.debug("Lấy danh sách đánh giá của trạm: {}", stationId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratings = ratingRepository.findByStationId(stationId, pageable);

        return ratings.map(ratingMapper::toResponseDTO);
    }

    /**
     * Lấy tất cả đánh giá của tài xế
     */
    public Page<RatingResponse> getDriverRatings(String driverId, int page, int size) {
        log.debug("Lấy danh sách đánh giá của tài xế: {}", driverId);

        Pageable pageable = PageRequest.of(page, size);
        Page<Rating> ratings = ratingRepository.findByDriverId(driverId, pageable);

        return ratings.map(ratingMapper::toResponseDTO);
    }

    /**
     * Lấy thống kê đánh giá của trạm
     */
    public StationRatingStatsResponse getStationRatingStats(String stationId) {
        log.debug("Lấy thống kê đánh giá của trạm: {}", stationId);

        Long totalRatings = ratingRepository.countByStationId(stationId);
        Double averageScore = ratingRepository.calculateAverageScoreByStationId(stationId);

        return StationRatingStatsResponse.builder()
                .stationId(stationId)
                .totalRatings(totalRatings)
                .averageScore(averageScore != null ? averageScore : 0.0)
                .fiveStarCount(ratingRepository.countByStationIdAndScore(stationId, 5))
                .fourStarCount(ratingRepository.countByStationIdAndScore(stationId, 4))
                .threeStarCount(ratingRepository.countByStationIdAndScore(stationId, 3))
                .twoStarCount(ratingRepository.countByStationIdAndScore(stationId, 2))
                .oneStarCount(ratingRepository.countByStationIdAndScore(stationId, 1))
                .build();
    }

    /**
     * Xóa đánh giá
     */
    @Transactional
    public void deleteRating(Long id) {
        log.info("Xóa đánh giá ID: {}", id);

        if (!ratingRepository.existsById(id)) {
            throw new NotFoundException("Không tìm thấy đánh giá với ID: " + id);
        }

        ratingRepository.deleteById(id);

        log.info("Đã xóa đánh giá ID: {}", id);
    }

    /**
     * Cập nhật đánh giá (chỉ cho phép sửa score và comment)
     */
    @Transactional
    public RatingResponse updateRating(Long id, RatingRequest requestDTO) {
        log.info("Cập nhật đánh giá ID: {}", id);

        Rating rating = ratingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá với ID: " + id));

        // Chỉ cập nhật score & comment nếu có trong request
        if (requestDTO.getScore() != null) {
            rating.setScore(requestDTO.getScore());
        }
        if (requestDTO.getComment() != null) {
            rating.setComment(requestDTO.getComment());
        }

        Rating saved = ratingRepository.save(rating);
        return ratingMapper.toResponseDTO(saved);
    }

    /**
     * Lấy đánh giá theo bookingId
     */
    public RatingResponse getRatingByBookingId(String bookingId) {
        log.debug("Lấy đánh giá theo bookingId: {}", bookingId);
        Rating rating = ratingRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy đánh giá cho bookingId: " + bookingId));
        return ratingMapper.toResponseDTO(rating);
    }
}