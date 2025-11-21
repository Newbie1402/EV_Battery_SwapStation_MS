package com.boilerplate.billing.controller;


import com.boilerplate.billing.model.DTO.CustomerPaymentsDTO;
import com.boilerplate.billing.model.DTO.PackagePaymentDTO;
import com.boilerplate.billing.model.DTO.SingleSwapPaymentDTO;
import com.boilerplate.billing.model.request.PackagePaymentRequest;
import com.boilerplate.billing.model.request.SingleSwapPaymentRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    //================ Package Payment =================
    @GetMapping("/package")
    public ResponseEntity<ResponseData<List<PackagePaymentDTO>>> getAllPackagePayments() {
        return paymentService.getAllPackagePayments();
    }

    @GetMapping("/package/{id}")
    public ResponseEntity<ResponseData<PackagePaymentDTO>> getPackagePaymentById(@PathVariable Long id) {
        return paymentService.getPackagePaymentById(id);
    }

    @PostMapping("/package")
    public ResponseEntity<ResponseData<PackagePaymentDTO>> createPackagePayment(@RequestBody PackagePaymentRequest request) {
        return paymentService.createPackagePayment(request);
    }

    @DeleteMapping("/package/{id}")
    public ResponseEntity<ResponseData<Void>> deletePackagePayment(@PathVariable Long id) {
        return paymentService.deletePackagePayment(id);
    }

    //================ Single Swap Payment =================
    @GetMapping("/swap")
    public ResponseEntity<ResponseData<List<SingleSwapPaymentDTO>>> getAllSingleSwapPayments() {
        return paymentService.getAllSingleSwapPayments();
    }

    @GetMapping("/swap/{id}")
    public ResponseEntity<ResponseData<SingleSwapPaymentDTO>> getSingleSwapPaymentById(@PathVariable Long id) {
        return paymentService.getSingleSwapPaymentById(id);
    }

    @PostMapping("/swap")
    public ResponseEntity<ResponseData<SingleSwapPaymentDTO>> createSingleSwapPayment(@RequestBody SingleSwapPaymentRequest request) {
        return paymentService.createSingleSwapPayment(request);
    }

    @DeleteMapping("/swap/{id}")
    public ResponseEntity<ResponseData<Void>> deleteSingleSwapPayment(@PathVariable Long id) {
        return paymentService.deleteSingleSwapPayment(id);
    }

    @PostMapping("/single/confirm/{id}")
    public ResponseEntity<ResponseData<Void>> confirmSinglePayment(@PathVariable Long id) {
        return paymentService.confirmCashSingglePayment(id);
    }

    /**
     * Xác nhận thanh toán cho PackagePayment
     */
    @PostMapping("/package/confirm/{id}")
    public ResponseEntity<ResponseData<Void>> confirmPackagePayment(@PathVariable Long id) {
        return paymentService.confirmCashPackeagePayment(id);
    }

    //================ Get All Payments By Customer =================
    @Operation(
            summary = "Lấy tất cả thanh toán theo Customer ID",
            description = "API trả về danh sách tất cả thanh toán (bao gồm cả swap và package) của một khách hàng dựa trên employeeId (customerId)"
    )
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ResponseData<CustomerPaymentsDTO>> getAllPaymentsByCustomerId(@PathVariable String customerId) {
        return paymentService.getAllPaymentsByCustomerId(customerId);
    }

}
