package com.boilerplate.billing.controller;

import com.boilerplate.billing.model.request.VNPAYRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.service.VnpayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vnpay")
@RequiredArgsConstructor
public class VnpayController {

    private final VnpayService vnpayService;

    // ===== TẠO URL THANH TOÁN =====
    @PostMapping("/create")
    public ResponseEntity<ResponseData<String>> createPaymentUrl(@RequestBody VNPAYRequest request,
                                                                 HttpServletRequest httpRequest) {
        ResponseData<String> response = vnpayService.createPaymentUrl(request, httpRequest);
        return ResponseEntity.ok(response);
    }

    // ===== CALLBACK VNPAY =====
    @GetMapping("/callback")
    public ResponseEntity<ResponseData<String>> vnpayCallback(@RequestParam Map<String, String> allParams) {
        try {
            // Service sẽ tự lấy type và paymentId từ params
            ResponseData<String> response = vnpayService.handleVnpayCallback(allParams);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(new ResponseData<>(400, e.getMessage(), null));
        }
    }
}
