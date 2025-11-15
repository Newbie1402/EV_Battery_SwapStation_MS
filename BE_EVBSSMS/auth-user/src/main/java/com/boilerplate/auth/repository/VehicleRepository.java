package com.boilerplate.auth.repository;

import com.boilerplate.auth.enums.VehicleStatus;
import com.boilerplate.auth.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý thao tác với Vehicle entity
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    /**
     * Tìm phương tiện theo vehicleId (mã xe công khai)
     */
    Optional<Vehicle> findByVehicleId(String vehicleId);

    /**
     * Kiểm tra vehicleId đã tồn tại chưa
     */
    boolean existsByVehicleId(String vehicleId);

    /**
     * Tìm phương tiện theo VIN
     */
    Optional<Vehicle> findByVin(String vin);

    /**
     * Tìm phương tiện theo biển số
     */
    Optional<Vehicle> findByLicensePlate(String licensePlate);

    /**
     * Kiểm tra VIN đã tồn tại chưa
     */
    boolean existsByVin(String vin);

    /**
     * Kiểm tra biển số đã tồn tại chưa
     */
    boolean existsByLicensePlate(String licensePlate);

    /**
     * Tìm tất cả phương tiện của một người dùng
     */
    @Deprecated
    List<Vehicle> findByUserId(Long userId);

    /**
     * Tìm tất cả phương tiện của một người dùng theo employeeId
     */
    @Query("SELECT v FROM Vehicle v JOIN FETCH v.user u WHERE u.employeeId = :employeeId")
    List<Vehicle> findByUserEmployeeId(@Param("employeeId") String employeeId);

    /**
     * Tìm phương tiện theo ID và userId (đảm bảo phương tiện thuộc về user) - DEPRECATED
     */
    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);

    /**
     * Tìm phương tiện theo vehicleId và userId
     */
    Optional<Vehicle> findByVehicleIdAndUserId(String vehicleId, Long userId);

    /**
     * Tìm phương tiện theo vehicleId và employeeId
     * QUAN TRỌNG: User PHẢI có employeeId thì mới query được
     */
    @Query("SELECT v FROM Vehicle v JOIN FETCH v.user u WHERE v.vehicleId = :vehicleId AND u.employeeId = :employeeId")
    Optional<Vehicle> findByVehicleIdAndUserEmployeeId(@Param("vehicleId") String vehicleId, @Param("employeeId") String employeeId);

    /**
     * Tìm tất cả phương tiện của một người dùng theo trạng thái
     */
    List<Vehicle> findByUserIdAndStatus(Long userId, VehicleStatus status);

    /**
     * Tìm tất cả phương tiện chưa được cấp phát (chưa có chủ)
     */
    List<Vehicle> findByUserIsNull();

    /**
     * Đếm số lượng phương tiện của một người dùng
     */
    long countByUserId(Long userId);

    /**
     * Đếm số lượng phương tiện đang hoạt động của một người dùng
     */
    long countByUserIdAndStatus(Long userId, VehicleStatus status);

    /**
     * Tìm phương tiện theo model
     */
    List<Vehicle> findByModel(String model);

    /**
     * Tìm phương tiện theo loại pin
     */
    @Query("SELECT v FROM Vehicle v WHERE v.batteryType = :batteryType")
    List<Vehicle> findByBatteryType(@Param("batteryType") String batteryType);
}
