package com.boilerplate.station.controller;

import com.boilerplate.station.model.DTO.BatteryDTO;
import com.boilerplate.station.model.createRequest.AddBatteryRequest;
import com.boilerplate.station.model.createRequest.BatteryCodeRequest;
import com.boilerplate.station.model.createRequest.BatteryRequest;
import com.boilerplate.station.model.createRequest.UpdateBatteryHealthRequest;
import com.boilerplate.station.model.event.Consumer.BatteryHoldEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapEvent;
import com.boilerplate.station.model.event.Consumer.BatterySwapStation;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.service.BatteryService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/batteries")
@RequiredArgsConstructor
public class BatteryController {

    private final BatteryService batteryService;

    @Operation(
            summary = "Lấy danh sách tất cả pin",
            description = "API trả về danh sách đầy đủ thông tin của tất cả các pin trong hệ thống trạm hoán đổi pin."
    )
    @GetMapping("/getall")
    public ResponseEntity<ResponseData<List<BatteryDTO>>> getAllBatteries() {
        return batteryService.getAllBatteries();
    }

    @Operation(
            summary = "Lấy thông tin chi tiết pin theo ID",
            description = "API trả về thông tin chi tiết của một pin dựa vào ID được truyền vào."
    )
    @GetMapping("/get/{id}")
    public ResponseEntity<ResponseData<BatteryDTO>> getBatteryById(@PathVariable Long id) {
        return batteryService.getBatteryById(id);
    }

    @Operation(
            summary = "Tạo pin mới",
            description = "API cho phép tạo mới một pin với các thông tin như mã pin, dung lượng, trạng thái và vị trí hiện tại."
    )
    @PostMapping("/create")
    public ResponseEntity<ResponseData<BatteryDTO>> createBattery(@RequestBody BatteryRequest request) {
        return batteryService.createBattery(request);
    }

    @Operation(
            summary = "Cập nhật thông tin pin",
            description = "API cập nhật thông tin của một pin dựa trên batteryCode, bao gồm trạng thái, dung lượng hoặc các thuộc tính khác."
    )
    @PutMapping("/update/{batteryCode}")
    public ResponseEntity<ResponseData<BatteryDTO>> updateBattery(
            @PathVariable String batteryCode,
            @RequestBody BatteryRequest request) {
        return batteryService.updateBattery(batteryCode, request);
    }

    @Operation(
            summary = "Xóa pin",
            description = "API xóa một pin khỏi hệ thống dựa trên ID. Chỉ sử dụng với các pin ngưng hoạt động."
    )
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<ResponseData<Void>> deleteBattery(@PathVariable Long id) {
        return batteryService.deleteBattery(id);
    }

    @Operation(
            summary = "Xử lý sự kiện hoán đổi pin từ xe sang trạm",
            description = "API tiếp nhận sự kiện BatterySwapEvent khi người dùng đổi pin tại trạm. Hệ thống cập nhật trạng thái pin và lưu lịch sử hoán đổi."
    )
    @PostMapping("/event/swapverhice-to-station")
    public ResponseEntity<ResponseData<Void>> handleBatterySwapEvent(@RequestBody BatterySwapEvent event) {
        return batteryService.handleBatterySwap(event);
    }

    @Operation(
            summary = "Xử lý sự kiện chuyển pin giữa các trạm",
            description = "API tiếp nhận BatterySwapStation event để xử lý việc điều phối pin từ trạm này sang trạm khác."
    )
    @PostMapping("/event/swapstation-to-station")
    public ResponseEntity<ResponseData<Void>> handleBatterySwapStationEvent(@RequestBody BatterySwapStation event) {
        return batteryService.handleBatterySwapStation(event);
    }

    @Operation(
            summary = "Xử lý sự kiện giữ pin",
            description = "API tiếp nhận sự kiện BatteryHoldEvent khi một pin được giữ tại trạm (ví dụ: bảo trì, sạc hoặc kiểm tra)."
    )
    @PostMapping("/event/hold")
    public ResponseEntity<ResponseData<Void>> handleBatteryHoldEvent(@RequestBody BatteryHoldEvent event) {
        return batteryService.holdBattery(event);
    }

    @Operation(
            summary = "Tìm pin theo mã pin",
            description = "API tìm kiếm pin theo mã pin (battery code). Trả về thông tin pin tương ứng nếu tồn tại."
    )
    @PostMapping("/get/batterycode")
    public ResponseEntity<ResponseData<BatteryDTO>> getBatteryCode(@RequestBody BatteryCodeRequest request) {
        return batteryService.getBatteriesByBatteryCode(request);
    }

    @PostMapping("/add-battery")
    public ResponseEntity<ResponseData<BatteryDTO>> addBattery(@RequestBody AddBatteryRequest request) {
        return batteryService.addBattery(request);
    }

    @Operation(
            summary = "Cập nhật chỉ số soh/soc cho pin",
            description = "Chỉ cập nhật hai trường soh và/hoặc soc theo batteryCode; các trường khác giữ nguyên."
    )
    @PatchMapping("/update-health/{batteryCode}")
    public ResponseEntity<ResponseData<BatteryDTO>> updateBatteryHealth(
            @PathVariable String batteryCode,
            @RequestBody @Validated UpdateBatteryHealthRequest request
    ) {
        return batteryService.updateBatteryHealth(batteryCode, request);
    }
}
