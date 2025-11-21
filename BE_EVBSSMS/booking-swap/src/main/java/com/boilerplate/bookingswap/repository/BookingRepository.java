package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.enums.BookingStatus;
import com.boilerplate.bookingswap.model.entity.Booking;
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
 * Repository quản lý các thao tác database cho Booking
 */
@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    /**
     * Tìm tất cả booking của một tài xế
     * @param driverId ID của tài xế
     * @return Danh sách booking
     */
    List<Booking> findByDriverId(String driverId);

    /**
     * Tìm tất cả booking của một tài xế với phân trang
     * @param driverId ID của tài xế
     * @param pageable Thông tin phân trang
     * @return Trang booking
     */
    Page<Booking> findByDriverId(String driverId, Pageable pageable);

    /**
     * Tìm tất cả booking tại một trạm
     * @param stationId ID của trạm
     * @return Danh sách booking
     */

    /**
     * Tìm tất cả booking tại một trạm với phân trang
     * @param stationId ID của trạm
     * @param pageable Thông tin phân trang
     * @return Trang booking
     */
    Page<Booking> findByStationId(String stationId, Pageable pageable);

    /**
     * Tìm booking theo trạng thái
     * @param status Trạng thái booking
     * @return Danh sách booking
     */
    List<Booking> findByBookingStatus(BookingStatus status);

    /**
     * Tìm booking theo trạng thái với phân trang
     * @param status Trạng thái booking
     * @param pageable Thông tin phân trang
     * @return Trang booking
     */
    Page<Booking> findByBookingStatus(BookingStatus status, Pageable pageable);

    /**
     * Tìm booking của tài xế theo trạng thái
     * @param driverId ID của tài xế
     * @param status Trạng thái booking
     * @return Danh sách booking
     */
    List<Booking> findByDriverIdAndBookingStatus(String driverId, BookingStatus status);

    /**
     * Tìm booking của tài xế tại một trạm
     * @param driverId ID của tài xế
     * @param stationId ID của trạm
     * @return Danh sách booking
     */
    List<Booking> findByDriverIdAndStationId(String driverId, String stationId);

    /**
     * Tìm booking theo khoảng thời gian đặt lịch
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách booking
     */
    List<Booking> findByScheduledTimeBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm booking của tài xế theo khoảng thời gian
     * @param driverId ID của tài xế
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách booking
     */
    @Query("SELECT b FROM Booking b WHERE b.driverId = :driverId " +
           "AND b.scheduledTime BETWEEN :startTime AND :endTime " +
           "ORDER BY b.scheduledTime DESC")
    List<Booking> findByDriverIdAndScheduledTimeBetween(
        @Param("driverId") String driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Tìm booking tại trạm theo khoảng thời gian
     * @param stationId ID của trạm
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách booking
     */
    @Query("SELECT b FROM Booking b WHERE b.stationId = :stationId " +
           "AND b.scheduledTime BETWEEN :startTime AND :endTime " +
           "ORDER BY b.scheduledTime ASC")
    List<Booking> findByStationIdAndScheduledTimeBetween(
        @Param("stationId") String stationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Tìm booking theo ID thanh toán
     * @param paymentId ID thanh toán
     * @return Optional booking
     */
    Optional<Booking> findByPaymentId(Integer paymentId);

    /**
     * Tìm booking theo ID gói thuê
     * @param packageId ID gói thuê
     * @return Danh sách booking
     */
    List<Booking> findByPackageId(String packageId);

    /**
     * Đếm số booking của tài xế theo trạng thái
     * @param driverId ID của tài xế
     * @param status Trạng thái
     * @return Số lượng booking
     */
    Long countByDriverIdAndBookingStatus(String driverId, BookingStatus status);

    /**
     * Đếm số booking tại trạm theo trạng thái
     * @param stationId ID của trạm
     * @param status Trạng thái
     * @return Số lượng booking
     */
    Long countByStationIdAndBookingStatus(String stationId, BookingStatus status);

    /**
     * Kiểm tra tài xế có booking đang chờ xử lý không
     * @param driverId ID của tài xế
     * @return true nếu có, false nếu không
     */
    boolean existsByDriverIdAndBookingStatus(String driverId, BookingStatus status);

    /**
     * Tìm booking gần nhất của tài xế
     * @param driverId ID của tài xế
     * @return Optional booking
     */
    @Query("SELECT b FROM Booking b WHERE b.driverId = :driverId " +
           "ORDER BY b.scheduledTime DESC LIMIT 1")
    Optional<Booking> findLatestByDriverId(@Param("driverId") String driverId);

    /**
     * Tìm các booking sắp diễn ra (trong 24h tới)
     * @param currentTime Thời gian hiện tại
     * @param futureTime Thời gian tương lai (24h sau)
     * @return Danh sách booking
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus = 'CONFIRMED' " +
           "AND b.scheduledTime BETWEEN :currentTime AND :futureTime " +
           "ORDER BY b.scheduledTime ASC")
    List<Booking> findUpcomingBookings(
        @Param("currentTime") LocalDateTime currentTime,
        @Param("futureTime") LocalDateTime futureTime
    );

    /**
     * Tìm các booking quá hạn chưa hoàn thành
     * @param currentTime Thời gian hiện tại
     * @return Danh sách booking
     */
    @Query("SELECT b FROM Booking b WHERE b.bookingStatus IN ('PENDING', 'CONFIRMED') " +
           "AND b.scheduledTime < :currentTime")
    List<Booking> findOverdueBookings(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Thống kê số booking theo trạng thái trong khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @param status Trạng thái
     * @return Số lượng booking
     */
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.createdAt BETWEEN :startTime AND :endTime " +
           "AND b.bookingStatus = :status")
    Long countBookingsByStatusAndDateRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") BookingStatus status
    );

    /**
     * Tìm kiếm booking với nhiều điều kiện
     * @param driverId ID tài xế (có thể null)
     * @param stationId ID trạm (có thể null)
     * @param status Trạng thái (có thể null)
     * @param startTime Thời gian bắt đầu (có thể null)
     * @param endTime Thời gian kết thúc (có thể null)
     * @param pageable Thông tin phân trang
     * @return Trang booking
     */
    @Query("SELECT b FROM Booking b WHERE " +
           "(:driverId IS NULL OR b.driverId = :driverId) AND " +
           "(:stationId IS NULL OR b.stationId = :stationId) AND " +
           "(:status IS NULL OR b.bookingStatus = :status) AND " +
           "(:startTime IS NULL OR b.scheduledTime >= :startTime) AND " +
           "(:endTime IS NULL OR b.scheduledTime <= :endTime) " +
           "ORDER BY b.scheduledTime DESC")
    Page<Booking> searchBookings(
        @Param("driverId") String driverId,
        @Param("stationId") String stationId,
        @Param("status") BookingStatus status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );
}

