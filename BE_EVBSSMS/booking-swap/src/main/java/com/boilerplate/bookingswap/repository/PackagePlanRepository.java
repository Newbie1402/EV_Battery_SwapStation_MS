package com.boilerplate.bookingswap.repository;

import com.boilerplate.bookingswap.enums.PackageStatus;
import com.boilerplate.bookingswap.enums.PackageType;
import com.boilerplate.bookingswap.model.entity.PackagePlan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý các thao tác database cho PackagePlan
 */
@Repository
public interface PackagePlanRepository extends JpaRepository<PackagePlan, Long> {

    /**
     * Tìm gói thuê theo tên
     * @param name Tên gói
     * @return Optional package plan
     */
    Optional<PackagePlan> findByName(String name);

    /**
     * Tìm gói thuê theo tên và status
     * @param name Tên gói
     * @param status Trạng thái gói
     * @return Optional package plan
     */
    Optional<PackagePlan> findByNameAndStatus(String name, PackageStatus status);

    /**
     * Tìm gói thuê theo status
     * @param status Trạng thái gói
     * @return Danh sách gói thuê
     */
    List<PackagePlan> findByStatus(PackageStatus status);

    /**
     * Tìm gói thuê theo status với phân trang
     * @param status Trạng thái gói
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    Page<PackagePlan> findByStatus(PackageStatus status, Pageable pageable);

    /**
     * Tìm gói thuê theo loại
     * @param packageType Loại gói
     * @return Danh sách gói thuê
     */
    List<PackagePlan> findByPackageType(PackageType packageType);

    /**
     * Tìm gói thuê theo loại và status
     * @param packageType Loại gói
     * @param status Trạng thái gói
     * @return Danh sách gói thuê
     */
    List<PackagePlan> findByPackageTypeAndStatus(PackageType packageType, PackageStatus status);

    /**
     * Tìm gói thuê theo loại với phân trang
     * @param packageType Loại gói
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    Page<PackagePlan> findByPackageType(PackageType packageType, Pageable pageable);

    /**
     * Tìm gói thuê theo loại và status với phân trang
     * @param packageType Loại gói
     * @param status Trạng thái gói
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    Page<PackagePlan> findByPackageTypeAndStatus(PackageType packageType, PackageStatus status, Pageable pageable);

    /**
     * Tìm gói thuê theo khoảng giá
     * @param minPrice Giá tối thiểu
     * @param maxPrice Giá tối đa
     * @return Danh sách gói thuê
     */
    List<PackagePlan> findByPriceBetween(BigDecimal minPrice, BigDecimal maxPrice);

    /**
     * Tìm gói thuê theo số lần đổi pin tối đa
     * @param maxSwapPerMonth Số lần đổi pin/tháng
     * @return Danh sách gói thuê
     */
    List<PackagePlan> findByMaxSwapPerMonth(int maxSwapPerMonth);

    /**
     * Tìm gói thuê có số lần đổi pin >= giá trị cho trước
     * @param minSwaps Số lần đổi pin tối thiểu
     * @return Danh sách gói thuê
     */
    @Query("SELECT p FROM PackagePlan p WHERE p.maxSwapPerMonth >= :minSwaps " +
           "ORDER BY p.maxSwapPerMonth ASC")
    List<PackagePlan> findByMinSwaps(@Param("minSwaps") int minSwaps);

    /**
     * Tìm tất cả gói thuê sắp xếp theo giá
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    @Query("SELECT p FROM PackagePlan p ORDER BY p.price ASC")
    Page<PackagePlan> findAllOrderByPriceAsc(Pageable pageable);

    /**
     * Tìm tất cả gói thuê sắp xếp theo số lần đổi pin
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    @Query("SELECT p FROM PackagePlan p ORDER BY p.maxSwapPerMonth DESC")
    Page<PackagePlan> findAllOrderByMaxSwapDesc(Pageable pageable);

    /**
     * Tìm gói thuê phổ biến nhất (có nhiều người đăng ký nhất) - chỉ lấy gói ACTIVE
     * Lưu ý: Cần join với UserPackageSubscription
     * @param limit Số lượng gói
     * @return Danh sách gói thuê
     */
    @Query("SELECT p FROM PackagePlan p " +
           "LEFT JOIN UserPackageSubscription s ON s.packagePlan.id = p.id " +
           "WHERE p.status = 'ACTIVE' " +
           "GROUP BY p.id ORDER BY COUNT(s) DESC LIMIT :limit")
    List<PackagePlan> findMostPopularPackages(@Param("limit") int limit);

    /**
     * Tìm gói thuê theo tên (tìm kiếm gần đúng)
     * @param name Tên gói cần tìm
     * @return Danh sách gói thuê
     */
    @Query("SELECT p FROM PackagePlan p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<PackagePlan> searchByName(@Param("name") String name);

    /**
     * Tìm gói thuê giá rẻ nhất theo loại
     * @param packageType Loại gói
     * @return Optional package plan
     */
    @Query("SELECT p FROM PackagePlan p WHERE p.packageType = :packageType " +
           "ORDER BY p.price ASC LIMIT 1")
    Optional<PackagePlan> findCheapestByType(@Param("packageType") PackageType packageType);

    /**
     * Tìm gói thuê có giá trị tốt nhất (giá/số lần đổi) - chỉ lấy gói ACTIVE
     * @param packageType Loại gói
     * @return Danh sách gói thuê
     */
    @Query("SELECT p FROM PackagePlan p WHERE p.packageType = :packageType AND p.status = 'ACTIVE' " +
           "ORDER BY (p.price / p.maxSwapPerMonth) ASC")
    List<PackagePlan> findBestValuePackages(@Param("packageType") PackageType packageType);

    /**
     * Kiểm tra tên gói đã tồn tại chưa (trong các gói ACTIVE)
     * @param name Tên gói
     * @return true nếu tồn tại, false nếu không
     */
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM PackagePlan p WHERE p.name = :name AND p.status = 'ACTIVE'")
    boolean existsByName(@Param("name") String name);

    /**
     * Đếm số lượng gói theo loại
     * @param packageType Loại gói
     * @return Số lượng gói
     */
    Long countByPackageType(PackageType packageType);

    /**
     * Tìm kiếm gói thuê với nhiều điều kiện - chỉ lấy gói ACTIVE
     * @param name Tên gói (có thể null)
     * @param packageType Loại gói (có thể null)
     * @param minPrice Giá tối thiểu (có thể null)
     * @param maxPrice Giá tối đa (có thể null)
     * @param minSwaps Số lần đổi tối thiểu (có thể null)
     * @param pageable Thông tin phân trang
     * @return Trang gói thuê
     */
    @Query("SELECT p FROM PackagePlan p WHERE " +
           "p.status = 'ACTIVE' AND " +
           "(:name IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :name, '%'))) AND " +
           "(:packageType IS NULL OR p.packageType = :packageType) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minSwaps IS NULL OR p.maxSwapPerMonth >= :minSwaps) " +
           "ORDER BY p.price ASC")
    Page<PackagePlan> searchPackages(
        @Param("name") String name,
        @Param("packageType") PackageType packageType,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minSwaps") Integer minSwaps,
        Pageable pageable
    );

    /**
     * Tính giá trung bình của các gói thuê
     * @return Giá trung bình
     */
    @Query("SELECT AVG(p.price) FROM PackagePlan p")
    BigDecimal calculateAveragePrice();

    /**
     * Tính giá trung bình theo loại gói
     * @param packageType Loại gói
     * @return Giá trung bình
     */
    @Query("SELECT AVG(p.price) FROM PackagePlan p WHERE p.packageType = :packageType")
    BigDecimal calculateAveragePriceByType(@Param("packageType") PackageType packageType);

    /**
     * Tìm gói thuê mới nhất
     * @param limit Số lượng
     * @return Danh sách gói thuê
     */
    @Query("SELECT p FROM PackagePlan p ORDER BY p.createdAt DESC LIMIT :limit")
    List<PackagePlan> findNewestPackages(@Param("limit") int limit);
}

