package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.enums.TicketStatus;
import com.boilerplate.bookingswap.model.entity.SupportTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository quản lý các thao tác database cho SupportTicket
 */
@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicket, Long> {

    /**
     * Tìm tất cả ticket của một tài xế
     * @param driverId ID tài xế
     * @return Danh sách ticket
     */
    List<SupportTicket> findByDriverId(String driverId);

    /**
     * Tìm tất cả ticket của một tài xế với phân trang
     * @param driverId ID tài xế
     * @param pageable Thông tin phân trang
     * @return Trang ticket
     */
    Page<SupportTicket> findByDriverId(String driverId, Pageable pageable);

    /**
     * Tìm ticket theo ID booking
     * @param bookingId ID booking
     * @return Danh sách ticket
     */
    List<SupportTicket> findByBookingId(String bookingId);

    /**
     * Tìm ticket theo trạng thái
     * @param status Trạng thái ticket
     * @return Danh sách ticket
     */
    List<SupportTicket> findByTicketStatus(TicketStatus status);

    /**
     * Tìm ticket theo trạng thái với phân trang
     * @param status Trạng thái ticket
     * @param pageable Thông tin phân trang
     * @return Trang ticket
     */
    Page<SupportTicket> findByTicketStatus(TicketStatus status, Pageable pageable);

    /**
     * Tìm ticket của tài xế theo trạng thái
     * @param driverId ID tài xế
     * @param status Trạng thái
     * @return Danh sách ticket
     */
    List<SupportTicket> findByDriverIdAndTicketStatus(String driverId, TicketStatus status);

    /**
     * Tìm ticket theo khoảng thời gian tạo
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách ticket
     */
    List<SupportTicket> findByCreatedAtBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Tìm ticket theo khoảng thời gian tạo với phân trang
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @param pageable Thông tin phân trang
     * @return Trang ticket
     */
    Page<SupportTicket> findByCreatedAtBetween(
        LocalDateTime startTime,
        LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * Đếm số ticket của tài xế
     * @param driverId ID tài xế
     * @return Số lượng ticket
     */
    Long countByDriverId(String driverId);

    /**
     * Đếm số ticket theo trạng thái
     * @param status Trạng thái
     * @return Số lượng ticket
     */
    Long countByTicketStatus(TicketStatus status);

    /**
     * Đếm số ticket của tài xế theo trạng thái
     * @param driverId ID tài xế
     * @param status Trạng thái
     * @return Số lượng ticket
     */
    Long countByDriverIdAndTicketStatus(String driverId, TicketStatus status);

    /**
     * Tìm ticket đang mở (OPEN, IN_PROGRESS)
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.ticketStatus IN ('OPEN', 'IN_PROGRESS') " +
           "ORDER BY t.createdAt ASC")
    List<SupportTicket> findOpenTickets();

    /**
     * Tìm ticket đang mở với phân trang
     * @param pageable Thông tin phân trang
     * @return Trang ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.ticketStatus IN ('OPEN', 'IN_PROGRESS') " +
           "ORDER BY t.createdAt ASC")
    Page<SupportTicket> findOpenTickets(Pageable pageable);

    /**
     * Tìm ticket của tài xế đang mở
     * @param driverId ID tài xế
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.driverId = :driverId " +
           "AND t.ticketStatus IN ('OPEN', 'IN_PROGRESS') " +
           "ORDER BY t.createdAt DESC")
    List<SupportTicket> findOpenTicketsByDriverId(@Param("driverId") String driverId);

    /**
     * Tìm ticket đã đóng (RESOLVED, CLOSED)
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.ticketStatus IN ('RESOLVED', 'CLOSED') " +
           "ORDER BY t.updatedAt DESC")
    List<SupportTicket> findClosedTickets();

    /**
     * Tìm ticket chưa có phản hồi
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.response IS NULL " +
           "AND t.ticketStatus != 'CLOSED' " +
           "ORDER BY t.createdAt ASC")
    List<SupportTicket> findTicketsWithoutResponse();

    /**
     * Tìm ticket đã có phản hồi
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.response IS NOT NULL " +
           "ORDER BY t.updatedAt DESC")
    List<SupportTicket> findTicketsWithResponse();

    /**
     * Tìm ticket quá hạn xử lý (mở quá 48h)
     * @param beforeTime Thời gian giới hạn (hiện tại - 48h)
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.ticketStatus IN ('OPEN', 'IN_PROGRESS') " +
           "AND t.createdAt < :beforeTime " +
           "ORDER BY t.createdAt ASC")
    List<SupportTicket> findOverdueTickets(@Param("beforeTime") LocalDateTime beforeTime);

    /**
     * Tìm ticket theo tiêu đề (tìm kiếm gần đúng)
     * @param title Tiêu đề cần tìm
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE LOWER(t.title) LIKE LOWER(CONCAT('%', :title, '%')) " +
           "ORDER BY t.createdAt DESC")
    List<SupportTicket> searchByTitle(@Param("title") String title);

    /**
     * Tìm ticket theo mô tả (tìm kiếm gần đúng)
     * @param description Mô tả cần tìm
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE LOWER(t.description) LIKE LOWER(CONCAT('%', :description, '%')) " +
           "ORDER BY t.createdAt DESC")
    List<SupportTicket> searchByDescription(@Param("description") String description);

    /**
     * Tìm kiếm ticket với nhiều điều kiện
     * @param driverId ID tài xế (có thể null)
     * @param status Trạng thái (có thể null)
     * @param startTime Thời gian bắt đầu (có thể null)
     * @param endTime Thời gian kết thúc (có thể null)
     * @param pageable Thông tin phân trang
     * @return Trang ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE " +
           "(:driverId IS NULL OR t.driverId = :driverId) AND " +
           "(:status IS NULL OR t.ticketStatus = :status) AND " +
           "(:startTime IS NULL OR t.createdAt >= :startTime) AND " +
           "(:endTime IS NULL OR t.createdAt <= :endTime) " +
           "ORDER BY t.createdAt DESC")
    Page<SupportTicket> searchTickets(
        @Param("driverId") String driverId,
        @Param("status") TicketStatus status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime,
        Pageable pageable
    );

    /**
     * Thống kê số lượng ticket theo trạng thái
     * @return Map<Trạng thái, Số lượng>
     */
    @Query("SELECT t.ticketStatus as status, COUNT(t) as count FROM SupportTicket t " +
           "GROUP BY t.ticketStatus ORDER BY count DESC")
    List<Object[]> getTicketStatisticsByStatus();

    /**
     * Tìm ticket gần đây nhất của tài xế
     * @param driverId ID tài xế
     * @param limit Số lượng
     * @return Danh sách ticket
     */
    @Query("SELECT t FROM SupportTicket t WHERE t.driverId = :driverId " +
           "ORDER BY t.createdAt DESC LIMIT :limit")
    List<SupportTicket> findRecentTicketsByDriverId(
        @Param("driverId") String driverId,
        @Param("limit") int limit
    );

    /**
     * Đếm ticket theo trạng thái trong khoảng thời gian
     * @param status Trạng thái
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Số lượng ticket
     */
    @Query("SELECT COUNT(t) FROM SupportTicket t " +
           "WHERE t.ticketStatus = :status " +
           "AND t.createdAt BETWEEN :startTime AND :endTime")
    Long countByStatusAndDateRange(
        @Param("status") TicketStatus status,
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}

