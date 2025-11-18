package com.boilerplate.billing.testapi;

import com.boilerplate.billing.model.response.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing/batteries")
@RequiredArgsConstructor
public class BillingBatteryController {

    private final BillingBatteryService billingBatteryService;

    @GetMapping("/{batteryId}")
    public ResponseEntity<ResponseData<BatteryDTO>> getBattery(@PathVariable Long batteryId) {
        BatteryDTO battery = billingBatteryService.fetchBattery(batteryId);
        return ResponseEntity.ok(new ResponseData<>(200, "Lấy thông tin pin thành công", battery));
    }
}

