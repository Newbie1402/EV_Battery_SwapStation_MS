package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.enums.TransactionStatus;
import com.boilerplate.bookingswap.model.entity.BatterySwapTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý các thao tác database cho BatterySwapTransaction
 */
@Repository
public interface BatterySwapTransactionRepository extends JpaRepository<BatterySwapTransaction, Long> {

    /**
     * Tìm giao dịch theo ID booking
     * @param bookingId ID booking
     * @return Optional transaction
     */
    Optional<BatterySwapTransaction> findByBookingId(String bookingId);

    /**
     * Tìm tất cả giao dịch của một tài xế
     * @param driverId ID tài xế
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByDriverId(String driverId);

    /**
     * Tìm tất cả giao dịch của một tài xế với phân trang
     * @param driverId ID tài xế
     * @param pageable Thông tin phân trang
     * @return Trang giao dịch
     */
    Page<BatterySwapTransaction> findByDriverId(String driverId, Pageable pageable);

    /**
     * Tìm tất cả giao dịch tại một trạm
     * @param stationId ID trạm
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByStationId(String stationId);

    /**
     * Tìm tất cả giao dịch tại một trạm với phân trang
     * @param stationId ID trạm
     * @param pageable Thông tin phân trang
     * @return Trang giao dịch
     */
    Page<BatterySwapTransaction> findByStationId(String stationId, Pageable pageable);

    /**
     * Tìm giao dịch theo trạng thái
     * @param status Trạng thái giao dịch
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByTransactionStatus(TransactionStatus status);

    /**
     * Tìm giao dịch theo pin cũ
     * @param oldBatteryId ID pin cũ
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByOldBatteryId(String oldBatteryId);

    /**
     * Tìm giao dịch theo pin mới
     * @param newBatteryId ID pin mới
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByNewBatteryId(String newBatteryId);

    /**
     * Tìm giao dịch theo khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm giao dịch của tài xế theo khoảng thời gian
     * @param driverId ID tài xế
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách giao dịch
     */
    @Query("SELECT t FROM BatterySwapTransaction t WHERE t.driverId = :driverId " +
           "AND t.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY t.createdAt DESC")
    List<BatterySwapTransaction> findByDriverIdAndCreatedAtBetween(
        @Param("driverId") String driverId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Tìm giao dịch tại trạm theo khoảng thời gian
     * @param stationId ID trạm
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách giao dịch
     */
    @Query("SELECT t FROM BatterySwapTransaction t WHERE t.stationId = :stationId " +
           "AND t.createdAt BETWEEN :startTime AND :endTime " +
           "ORDER BY t.createdAt DESC")
    List<BatterySwapTransaction> findByStationIdAndCreatedAtBetween(
        @Param("stationId") String stationId,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Đếm số giao dịch của tài xế
     * @param driverId ID tài xế
     * @return Số lượng giao dịch
     */
    Long countByDriverId(String driverId);

    /**
     * Đếm số giao dịch tại trạm
     * @param stationId ID trạm
     * @return Số lượng giao dịch
     */
    Long countByStationId(String stationId);

    /**
     * Đếm số giao dịch theo trạng thái
     * @param status Trạng thái
     * @return Số lượng giao dịch
     */
    Long countByTransactionStatus(TransactionStatus status);

    /**
     * Tính tổng doanh thu của tài xế
     * @param driverId ID tài xế
     * @return Tổng doanh thu
     */
    @Query("SELECT SUM(t.amount) FROM BatterySwapTransaction t " +
           "WHERE t.driverId = :driverId AND t.transactionStatus = 'COMPLETED'")
    BigDecimal calculateTotalAmountByDriverId(@Param("driverId") String driverId);

    /**
     * Tính tổng doanh thu tại trạm
     * @param stationId ID trạm
     * @return Tổng doanh thu
     */
    @Query("SELECT SUM(t.amount) FROM BatterySwapTransaction t " +
           "WHERE t.stationId = :stationId AND t.transactionStatus = 'COMPLETED'")
    BigDecimal calculateTotalAmountByStationId(@Param("stationId") String stationId);

    /**
     * Tính tổng doanh thu theo khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Tổng doanh thu
     */
    @Query("SELECT SUM(t.amount) FROM BatterySwapTransaction t " +
           "WHERE t.createdAt BETWEEN :startTime AND :endTime " +
           "AND t.transactionStatus = 'COMPLETED'")
    BigDecimal calculateTotalAmountByDateRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );

    /**
     * Tìm giao dịch gần nhất của tài xế
     * @param driverId ID tài xế
     * @return Optional transaction
     */
    @Query("SELECT t FROM BatterySwapTransaction t WHERE t.driverId = :driverId " +
           "ORDER BY t.createdAt DESC LIMIT 1")
    Optional<BatterySwapTransaction> findLatestByDriverId(@Param("driverId") String driverId);

    /**
     * Tìm giao dịch thành công của tài xế
     * @param driverId ID tài xế
     * @param status Trạng thái (COMPLETED)
     * @return Danh sách giao dịch
     */
    List<BatterySwapTransaction> findByDriverIdAndTransactionStatus(
        String driverId,
        TransactionStatus status
    );

    /**
     * Tìm lịch sử đổi pin của một viên pin
     * @param batteryId ID pin (có thể là oldBatteryId hoặc newBatteryId)
     * @return Danh sách giao dịch
     */
    @Query("SELECT t FROM BatterySwapTransaction t " +
           "WHERE t.oldBatteryId = :batteryId OR t.newBatteryId = :batteryId " +
           "ORDER BY t.createdAt DESC")
    List<BatterySwapTransaction> findBatterySwapHistory(@Param("batteryId") String batteryId);

    /**
     * Thống kê số lượng giao dịch theo trạng thái trong khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @param status Trạng thái
     * @return Số lượng giao dịch
     */
    @Query("SELECT COUNT(t) FROM BatterySwapTransaction t " +
           "WHERE t.createdAt BETWEEN :startTime AND :endTime " +
           "AND t.transactionStatus = :status")
    Long countTransactionsByStatusAndDateRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        @Param("status") TransactionStatus status
    );

    /**
     * Tìm các giao dịch đang chờ xử lý quá lâu
     * @param status Trạng thái (PENDING hoặc PROCESSING)
     * @param beforeTime Thời gian giới hạn
     * @return Danh sách giao dịch
     */
    @Query("SELECT t FROM BatterySwapTransaction t " +
           "WHERE t.transactionStatus = :status AND t.createdAt < :beforeTime")
    List<BatterySwapTransaction> findStuckTransactions(
        @Param("status") TransactionStatus status,
        @Param("beforeTime") LocalDateTime beforeTime
    );
}