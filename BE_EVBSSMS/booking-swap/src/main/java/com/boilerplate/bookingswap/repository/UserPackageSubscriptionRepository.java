package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.enums.SubscriptionStatus;
import com.boilerplate.bookingswap.model.entity.UserPackageSubscription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý các thao tác database cho UserPackageSubscription
 */
@Repository
public interface UserPackageSubscriptionRepository extends JpaRepository<UserPackageSubscription, Long> {

    /**
     * Tìm tất cả đăng ký của một người dùng
     * @param userId ID người dùng
     * @return Danh sách đăng ký
     */
    List<UserPackageSubscription> findByUserId(String userId);

    /**
     * Tìm tất cả đăng ký của một người dùng với phân trang
     * @param userId ID người dùng
     * @param pageable Thông tin phân trang
     * @return Trang đăng ký
     */
    Page<UserPackageSubscription> findByUserId(String userId, Pageable pageable);

    /**
     * Tìm đăng ký đang hoạt động của người dùng
     * @param userId ID người dùng
     * @param status Trạng thái ACTIVE
     * @return Optional subscription
     */
    Optional<UserPackageSubscription> findByUserIdAndStatus(String userId, SubscriptionStatus status);

    /**
     * Tìm tất cả đăng ký theo trạng thái
     * @param status Trạng thái
     * @return Danh sách đăng ký
     */
    List<UserPackageSubscription> findByStatus(SubscriptionStatus status);

    /**
     * Tìm tất cả đăng ký theo trạng thái với phân trang
     * @param status Trạng thái
     * @param pageable Thông tin phân trang
     * @return Trang đăng ký
     */
    Page<UserPackageSubscription> findByStatus(SubscriptionStatus status, Pageable pageable);

    /**
     * Tìm tất cả đăng ký của một gói thuê
     * @param packagePlanId ID gói thuê
     * @return Danh sách đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.packagePlan.id = :packagePlanId")
    List<UserPackageSubscription> findByPackagePlanId(@Param("packagePlanId") Long packagePlanId);

    /**
     * Tìm đăng ký đang hoạt động của người dùng
     * @param userId ID người dùng
     * @return Optional subscription
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.userId = :userId " +
           "AND s.status = 'ACTIVE' AND s.endDate > CURRENT_TIMESTAMP " +
           "ORDER BY s.endDate DESC LIMIT 1")
    Optional<UserPackageSubscription> findActiveSubscriptionByUserId(@Param("userId") String userId);

    /**
     * Tìm các đăng ký sắp hết hạn
     * @param currentTime Thời gian hiện tại
     * @param expiryTime Thời gian hết hạn (ví dụ: 7 ngày sau)
     * @return Danh sách đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.status = 'ACTIVE' " +
           "AND s.endDate BETWEEN :currentTime AND :expiryTime " +
           "ORDER BY s.endDate ASC")
    List<UserPackageSubscription> findExpiringSoonSubscriptions(
        @Param("currentTime") LocalDateTime currentTime,
        @Param("expiryTime") LocalDateTime expiryTime
    );

    /**
     * Tìm các đăng ký đã hết hạn nhưng chưa cập nhật trạng thái
     * @param currentTime Thời gian hiện tại
     * @return Danh sách đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.status = 'ACTIVE' " +
           "AND s.endDate < :currentTime")
    List<UserPackageSubscription> findExpiredSubscriptions(@Param("currentTime") LocalDateTime currentTime);

    /**
     * Tìm đăng ký theo khoảng thời gian bắt đầu
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Danh sách đăng ký
     */
    List<UserPackageSubscription> findByStartDateBetween(LocalDateTime startTime, LocalDateTime endTime);

    /**
     * Đếm số đăng ký của người dùng
     * @param userId ID người dùng
     * @return Số lượng đăng ký
     */
    Long countByUserId(String userId);

    /**
     * Đếm số đăng ký theo trạng thái
     * @param status Trạng thái
     * @return Số lượng đăng ký
     */
    Long countByStatus(SubscriptionStatus status);

    /**
     * Đếm số đăng ký của một gói thuê
     * @param packagePlanId ID gói thuê
     * @return Số lượng đăng ký
     */
    @Query("SELECT COUNT(s) FROM UserPackageSubscription s WHERE s.packagePlan.id = :packagePlanId")
    Long countByPackagePlanId(@Param("packagePlanId") Long packagePlanId);

    /**
     * Kiểm tra người dùng có đăng ký đang hoạt động không
     * @param userId ID người dùng
     * @param status Trạng thái ACTIVE
     * @return true nếu có, false nếu không
     */
    boolean existsByUserIdAndStatus(String userId, SubscriptionStatus status);

    /**
     * Tăng số lần sử dụng đổi pin
     * @param subscriptionId ID đăng ký
     * @return Số dòng bị ảnh hưởng
     */
    @Modifying
    @Query("UPDATE UserPackageSubscription s SET s.usedSwaps = s.usedSwaps + 1, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.id = :subscriptionId")
    int incrementUsedSwaps(@Param("subscriptionId") Long subscriptionId);

    /**
     * Cập nhật trạng thái đăng ký
     * @param subscriptionId ID đăng ký
     * @param status Trạng thái mới
     * @return Số dòng bị ảnh hưởng
     */
    @Modifying
    @Query("UPDATE UserPackageSubscription s SET s.status = :status, " +
           "s.updatedAt = CURRENT_TIMESTAMP WHERE s.id = :subscriptionId")
    int updateStatus(@Param("subscriptionId") Long subscriptionId, @Param("status") SubscriptionStatus status);

    /**
     * Tìm lịch sử đăng ký của người dùng
     * @param userId ID người dùng
     * @param pageable Thông tin phân trang
     * @return Trang đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.userId = :userId " +
           "ORDER BY s.startDate DESC")
    Page<UserPackageSubscription> findSubscriptionHistory(@Param("userId") String userId, Pageable pageable);

    /**
     * Tìm đăng ký có số lần sử dụng cao nhất
     * @param userId ID người dùng
     * @return Optional subscription
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.userId = :userId " +
           "ORDER BY s.usedSwaps DESC LIMIT 1")
    Optional<UserPackageSubscription> findMostUsedSubscriptionByUserId(@Param("userId") String userId);

    /**
     * Tìm đăng ký theo người dùng và gói thuê
     * @param userId ID người dùng
     * @param packagePlanId ID gói thuê
     * @return Danh sách đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE s.userId = :userId " +
           "AND s.packagePlan.id = :packagePlanId " +
           "ORDER BY s.startDate DESC")
    List<UserPackageSubscription> findByUserIdAndPackagePlanId(
        @Param("userId") String userId,
        @Param("packagePlanId") Long packagePlanId
    );

    /**
     * Thống kê số lượng đăng ký theo gói thuê
     * @return Map<Package ID, Số lượng>
     */
    @Query("SELECT s.packagePlan.id as packageId, COUNT(s) as count " +
           "FROM UserPackageSubscription s " +
           "GROUP BY s.packagePlan.id ORDER BY count DESC")
    List<Object[]> getSubscriptionStatisticsByPackage();

    /**
     * Thống kê số lượng đăng ký theo trạng thái
     * @return Map<Trạng thái, Số lượng>
     */
    @Query("SELECT s.status as status, COUNT(s) as count " +
           "FROM UserPackageSubscription s " +
           "GROUP BY s.status ORDER BY count DESC")
    List<Object[]> getSubscriptionStatisticsByStatus();

    /**
     * Tìm người dùng có nhiều đăng ký nhất
     * @param limit Số lượng
     * @return Danh sách user ID
     */
    @Query("SELECT s.userId, COUNT(s) as count FROM UserPackageSubscription s " +
           "GROUP BY s.userId ORDER BY count DESC LIMIT :limit")
    List<Object[]> findTopUsers(@Param("limit") int limit);

    /**
     * Tìm kiếm đăng ký với nhiều điều kiện
     * @param userId ID người dùng (có thể null)
     * @param packagePlanId ID gói thuê (có thể null)
     * @param status Trạng thái (có thể null)
     * @param startDate Ngày bắt đầu (có thể null)
     * @param endDate Ngày kết thúc (có thể null)
     * @param pageable Thông tin phân trang
     * @return Trang đăng ký
     */
    @Query("SELECT s FROM UserPackageSubscription s WHERE " +
           "(:userId IS NULL OR s.userId = :userId) AND " +
           "(:packagePlanId IS NULL OR s.packagePlan.id = :packagePlanId) AND " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:startDate IS NULL OR s.startDate >= :startDate) AND " +
           "(:endDate IS NULL OR s.endDate <= :endDate) " +
           "ORDER BY s.createdAt DESC")
    Page<UserPackageSubscription> searchSubscriptions(
        @Param("userId") String userId,
        @Param("packagePlanId") Long packagePlanId,
        @Param("status") SubscriptionStatus status,
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Đếm số đăng ký trong khoảng thời gian
     * @param startTime Thời gian bắt đầu
     * @param endTime Thời gian kết thúc
     * @return Số lượng đăng ký
     */
    @Query("SELECT COUNT(s) FROM UserPackageSubscription s " +
           "WHERE s.createdAt BETWEEN :startTime AND :endTime")
    Long countByDateRange(
        @Param("startTime") LocalDateTime startTime,
        @Param("endTime") LocalDateTime endTime
    );
}