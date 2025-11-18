package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatterySlotDTO;
import com.boilerplate.station.model.DTO.ChargeLogDTO;
import com.boilerplate.station.model.createRequest.BatterySlotRequest;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatterySlotService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/battery-slots")
@RequiredArgsConstructor
public class BatterySlotController {

    private final BatterySlotService batterySlotService;

    // ========================= GET ALL =========================
    @Operation(
            summary = "Lấy danh sách tất cả ô chứa pin",
            description = "API trả về danh sách tất cả Battery Slot trong hệ thống, bao gồm trạng thái và pin được gán vào (nếu có)."
    )
    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<BatterySlotDTO>>> getAllSlots() {
        return batterySlotService.getAllSlots();
    }

    // ========================= GET BY ID =========================
    @Operation(
            summary = "Lấy thông tin chi tiết một ô chứa pin",
            description = "API trả về thông tin chi tiết của một Battery Slot theo ID, bao gồm trạng thái và pin đang được gán."
    )
    @GetMapping("get/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> getSlotById(@PathVariable Long id) {
        return batterySlotService.getSlotById(id);
    }

    // ========================= CREATE =========================
    @Operation(
            summary = "Tạo ô chứa pin mới",
            description = "API tạo một Battery Slot mới tại trạm, bao gồm số thứ tự vị trí và trạng thái ban đầu."
    )
    @PostMapping("create")
    public ResponseEntity<ResponseData<BatterySlotDTO>> createSlot(@RequestBody BatterySlotRequest request) {
        return batterySlotService.createSlot(request);
    }

    // ========================= UPDATE =========================
    @Operation(
            summary = "Cập nhật thông tin ô chứa pin",
            description = "API cập nhật thông tin của Battery Slot, chẳng hạn như vị trí hoặc trạng thái hoạt động."
    )
    @PutMapping("update/{id}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> updateSlot(
            @PathVariable Long id,
            @RequestBody BatterySlotRequest request) {
        return batterySlotService.updateSlot(id, request);
    }

    // ========================= DELETE =========================
    @Operation(
            summary = "Xóa ô chứa pin",
            description = "API xóa một Battery Slot khỏi hệ thống dựa theo ID. Chỉ sử dụng cho các slot không còn hoạt động hoặc không có pin gán."
    )
    @DeleteMapping("delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteSlot(@PathVariable Long id) {
        return batterySlotService.deleteSlot(id);
    }

    // ========================= ASSIGN BATTERY TO SLOT =========================
    @Operation(
            summary = "Gán một pin vào ô chứa",
            description = "API gán pin (batteryId) vào một Battery Slot (slotId). Đồng thời cập nhật trạng thái của slot và pin tương ứng."
    )
    @PutMapping("/{slotId}/assign/{batteryId}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> assignBatteryToSlot(
            @PathVariable Long slotId,
            @PathVariable Long batteryId) {
        return batterySlotService.assignBatteryToSlot(slotId, batteryId);
    }

    // ========================= SET SLOT EMPTY =========================
    @Operation(
            summary = "Đặt trạng thái ô chứa thành trống",
            description = "API đặt Battery Slot về trạng thái EMPTY (không chứa pin). Sử dụng khi một pin được lấy ra (Full charge) hoặc chuyển đi nơi khác."
    )
    @PutMapping("/full/set-empty/{slotId}")
    public ResponseEntity<ResponseData<BatterySlotDTO>> setSlotEmpty(@PathVariable Long slotId) {
        return batterySlotService.setSlotEmpty(slotId);
    }

    // ========================= GET ALL CHARGE LOGS =========================
    @Operation(
            summary = "Lấy danh sách lịch sử sạc pin",
            description = "API trả về toàn bộ danh sách Charge Logs — ghi lại quá trình sạc pin tại các Battery Slot."
    )
    @GetMapping("/charge-logs/getall")
    public ResponseEntity<ResponseData<List<ChargeLogDTO>>> getAllChargeLogs() {
        return batterySlotService.getAllChargeLogs();
    }
}
