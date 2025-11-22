package com.boilerplate.station.repository;

import com.boilerplate.station.model.entity.BatterySupplyRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BatterySupplyRequestRepository extends JpaRepository<BatterySupplyRequest, Long> {

    // Tìm request theo stationCode
    List<BatterySupplyRequest> findAllByStation_StationCode(String stationCode);

    // (Optional) Tìm request theo Id nếu muốn custom, mặc dù findById đã có sẵn
    default BatterySupplyRequest findByIdCustom(Long id) {
        return findById(id).orElse(null);
    }
}
