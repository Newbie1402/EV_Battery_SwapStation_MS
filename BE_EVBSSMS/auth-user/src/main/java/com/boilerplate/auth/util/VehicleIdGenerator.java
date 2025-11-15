package com.boilerplate.auth.util;

import com.boilerplate.auth.exception.DuplicateResourceException;
import com.boilerplate.auth.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * Service sinh mã xe công khai (vehicleId)
 * Format: EV + 2 số cuối biển số + ddMMYY + model
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleIdGenerator {

    private final VehicleRepository vehicleRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("ddMMyy");

    /**
     * Sinh vehicleId duy nhất
     * @param licensePlate Biển số xe (ví dụ: 30A12345)
     * @param model Model xe (ví dụ: VF e34)
     * @return Mã xe công khai (ví dụ: EV45141124VFe34)
     */
    public String generateVehicleId(String licensePlate, String model) {
        // Lấy 2 số cuối của biển số
        String last2Digits = extractLast2Digits(licensePlate);

        // Lấy ngày tháng năm hiện tại (ddMMyy)
        String dateStr = LocalDateTime.now().format(DATE_FORMATTER);

        // Chuẩn hóa model (bỏ khoảng trắng)
        String normalizedModel = normalizeModel(model);

        // Tạo vehicleId
        String vehicleId = "EV" + last2Digits + dateStr + normalizedModel;

        // Kiểm tra trùng lặp (nếu trùng thì thêm suffix số)
        int suffix = 1;
        String finalVehicleId = vehicleId;
        while (vehicleRepository.existsByVehicleId(finalVehicleId)) {
            finalVehicleId = vehicleId + suffix;
            suffix++;
            if (suffix > 99) {
                throw new DuplicateResourceException(
                    "Không thể sinh vehicleId duy nhất sau 99 lần thử");
            }
        }

        log.info("Đã sinh vehicleId: {}", finalVehicleId);
        return finalVehicleId;
    }

    /**
     * Trích xuất 2 số cuối từ biển số
     * Ví dụ: 30A12345 -> 45
     */
    private String extractLast2Digits(String licensePlate) {
        if (licensePlate == null || licensePlate.isEmpty()) {
            throw new IllegalArgumentException("Biển số không được rỗng");
        }

        // Lấy tất cả các chữ số trong biển số
        String digits = licensePlate.replaceAll("[^0-9]", "");

        if (digits.length() < 2) {
            // Nếu không đủ 2 số, pad bằng 0
            return String.format("%02d", Integer.parseInt(digits));
        }

        // Lấy 2 số cuối
        return digits.substring(digits.length() - 2);
    }

    /**
     * Chuẩn hóa tên model (bỏ khoảng trắng và ký tự đặc biệt)
     * Ví dụ: "VF e34" -> "VFe34"
     */
    private String normalizeModel(String model) {
        if (model == null || model.isEmpty()) {
            return "UNKNOWN";
        }

        // Bỏ khoảng trắng và ký tự đặc biệt, chỉ giữ chữ và số
        String normalized = model.replaceAll("[^a-zA-Z0-9]", "");

        // Giới hạn độ dài tối đa 15 ký tự
        if (normalized.length() > 15) {
            normalized = normalized.substring(0, 15);
        }

        return normalized;
    }
}

