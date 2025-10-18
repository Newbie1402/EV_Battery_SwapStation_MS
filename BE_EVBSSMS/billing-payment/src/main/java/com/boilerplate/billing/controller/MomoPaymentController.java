package com.boilerplate.billing.controller;

import com.boilerplate.billing.model.request.MomoPaymentRequest;
import com.boilerplate.billing.service.MomoPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments/momo")
public class MomoPaymentController {

    @Autowired
    private MomoPaymentService momoPaymentService;

    // Tạo payment từ JSON body
    @PostMapping("/create")
    public ResponseEntity<?> createPayment(@RequestBody MomoPaymentRequest request) {
        try {
            Map<String, Object> result = momoPaymentService.createPayment(
                    request.getAmount(),
                    request.getOrderId(),
                    request.getCustomerId()
            );
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Nhận callback IPN từ MoMo
    @PostMapping("/ipn")
    public ResponseEntity<String> ipnCallback(@RequestBody Map<String, Object> data) {
        momoPaymentService.handleIPN(data);
        return ResponseEntity.ok("IPN received");
    }

    // Xử lý redirect sau khi thanh toán
    @GetMapping("/return")
    public ResponseEntity<String> returnUrl(@RequestParam Map<String, String> queryParams) {
        String resultCode = queryParams.get("resultCode");
        if ("0".equals(resultCode)) {
            return ResponseEntity.ok("Thanh toán thành công!");
        } else {
            return ResponseEntity.ok("Thanh toán thất bại!");
        }
    }
}
