package com.boilerplate.billing.testapi;



import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BillingBatteryService {

    private final BatteryServiceClient batteryClient;

    public BatteryDTO fetchBattery(Long batteryId) {
        return batteryClient.getBatteryById(batteryId);
    }
}
