package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.model.entity.Rating;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý các thao tác database cho Rating
 */
@Repository
public interface RatingRepository extends JpaRepository<Rating, Long> {

    /**
     * Tìm đánh giá theo ID booking
     * @param bookingId ID booking
     * @return Optional rating
     */
    Optional<Rating> findByBookingId(String bookingId);

    /**
     * Tìm tất cả đánh giá của một tài xế
     * @param driverId ID tài xế
     * @return Danh sách đánh giá
     */
    List<Rating> findByDriverId(String driverId);

    /**
     * Tìm tất cả đánh giá của một tài xế với phân trang
     * @param driverId ID tài xế
     * @param pageable Thông tin phân trang
     * @return Trang đánh giá
     */
    Page<Rating> findByDriverId(String driverId, Pageable pageable);

    /**
     * Tìm tất cả đánh giá của một trạm
     * @param stationId ID trạm
     * @return Danh sách đánh giá
     */
    List<Rating> findByStationId(String stationId);

    /**
     * Tìm tất cả đánh giá của một trạm với phân trang
     * @param stationId ID trạm
     * @param pageable Thông tin phân trang
     * @return Trang đánh giá
     */
    Page<Rating> findByStationId(String stationId, Pageable pageable);

    /**
     * Tìm đánh giá theo điểm số
     * @param score Điểm số (1-5)
     * @return Danh sách đánh giá
     */
    List<Rating> findByScore(int score);

    /**
     * Tìm đánh giá của trạm theo điểm số
     * @param stationId ID trạm
     * @param score Điểm số
     * @return Danh sách đánh giá
     */
    List<Rating> findByStationIdAndScore(String stationId, int score);

    /**
     * Tìm đánh giá theo khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách đánh giá
     */
    List<Rating> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm đánh giá của trạm theo khoảng thời gian
     * @param stationId ID trạm
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách đánh giá
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId " +
           "AND r.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY r.createdAt DESC")
    List<Rating> findByStationIdAndCreatedAtBetween(
        @Param("stationId") String stationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Đếm số đánh giá của trạm
     * @param stationId ID trạm
     * @return Số lượng đánh giá
     */
    Long countByStationId(String stationId);

    /**
     * Đếm số đánh giá của trạm theo điểm số
     * @param stationId ID trạm
     * @param score Điểm số
     * @return Số lượng đánh giá
     */
    Long countByStationIdAndScore(String stationId, int score);

    /**
     * Tính điểm trung bình của trạm
     * @param stationId ID trạm
     * @return Điểm trung bình
     */
    @Query("SELECT AVG(r.score) FROM Rating r WHERE r.stationId = :stationId")
    Double calculateAverageScoreByStationId(@Param("stationId") String stationId);

    /**
     * Tìm đánh giá cao nhất của trạm
     * @param stationId ID trạm
     * @return Danh sách đánh giá 5 sao
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId AND r.score = 5 " +
           "ORDER BY r.createdAt DESC")
    List<Rating> findTopRatingsByStationId(@Param("stationId") String stationId);

    /**
     * Tìm đánh giá thấp nhất của trạm
     * @param stationId ID trạm
     * @return Danh sách đánh giá 1-2 sao
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId AND r.score <= 2 " +
           "ORDER BY r.createdAt DESC")
    List<Rating> findLowRatingsByStationId(@Param("stationId") String stationId);

    /**
     * Kiểm tra tài xế đã đánh giá booking chưa
     * @param bookingId ID booking
     * @param driverId ID tài xế
     * @return true nếu đã đánh giá, false nếu chưa
     */
    boolean existsByBookingIdAndDriverId(String bookingId, String driverId);

    /**
     * Tìm các đánh giá có comment
     * @param stationId ID trạm
     * @return Danh sách đánh giá có comment
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId " +
           "AND r.comment IS NOT NULL AND r.comment != '' " +
           "ORDER BY r.createdAt DESC")
    List<Rating> findRatingsWithCommentByStationId(@Param("stationId") String stationId);

    /**
     * Lấy thống kê đánh giá của trạm theo điểm số
     * @param stationId ID trạm
     * @return Map<Điểm số, Số lượng>
     */
    @Query("SELECT r.score as score, COUNT(r) as count FROM Rating r " +
           "WHERE r.stationId = :stationId GROUP BY r.score ORDER BY r.score DESC")
    List<Object[]> getStationRatingStatistics(@Param("stationId") String stationId);

    /**
     * Tìm đánh giá gần đây nhất của trạm
     * @param stationId ID trạm
     * @param limit Số lượng
     * @return Danh sách đánh giá
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId " +
           "ORDER BY r.createdAt DESC LIMIT :limit")
    List<Rating> findRecentRatingsByStationId(
        @Param("stationId") String stationId,
        @Param("limit") int limit
    );

    /**
     * Tìm đánh giá có điểm số trong khoảng
     * @param stationId ID trạm
     * @param minScore Điểm số tối thiểu
     * @param maxScore Điểm số tối đa
     * @return Danh sách đánh giá
     */
    @Query("SELECT r FROM Rating r WHERE r.stationId = :stationId " +
           "AND r.score BETWEEN :minScore AND :maxScore " +
           "ORDER BY r.createdAt DESC")
    List<Rating> findByStationIdAndScoreBetween(
        @Param("stationId") String stationId,
        @Param("minScore") int minScore,
        @Param("maxScore") int maxScore
    );

    /**
     * Đếm tổng số đánh giá trong khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Số lượng đánh giá
     */
    Long countByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);
}

