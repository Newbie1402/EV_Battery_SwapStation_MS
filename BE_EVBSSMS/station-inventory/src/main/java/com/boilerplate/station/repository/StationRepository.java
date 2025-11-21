package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.Station;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface StationRepository extends JpaRepository<Station, Long> {
    Optional<Station> findByStationCode(String name);

    // Tìm trạm chứa staffCode trong danh sách staffs
    @Query("SELECT s FROM Station s WHERE :staffCode MEMBER OF s.staffs")
    Optional<Station> findByStaffCode(@Param("staffCode") String staffCode);

    // Kiểm tra staff đang thuộc một trạm khác (không phải trạm hiện tại)
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM Station s WHERE :staffCode MEMBER OF s.staffs AND s.id <> :stationId")
    boolean existsStaffInOtherStation(@Param("staffCode") String staffCode, @Param("stationId") Long stationId);

    // Kiểm tra staff đã thuộc bất kỳ trạm nào
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN TRUE ELSE FALSE END FROM Station s WHERE :staffCode MEMBER OF s.staffs")
    boolean existsStaffAnywhere(@Param("staffCode") String staffCode);
}
