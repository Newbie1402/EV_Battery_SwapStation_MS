package com.boilerplate.billing.service;

import com.boilerplate.billing.enums.PaymentMethod;
import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.exception.BillingException;
import com.boilerplate.billing.exception.BusinessException;
import com.boilerplate.billing.model.DTO.PackagePaymentDTO;
import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.request.PackagePaymentRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.repository.PackagePaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PackagePaymentService {

    private final PackagePaymentRepository packagePaymentRepository;

    /**
     * ✅ Tạo thanh toán (CASH)
     */
    @Transactional
    public ResponseEntity<ResponseData<PackagePaymentDTO>> createPayment(PackagePaymentRequest request) {
        if (request.getTotalAmount() == null || request.getTotalAmount() <= 0) {
            throw new BusinessException(BillingException.INVALID_PAYMENT_AMOUNT);
        }
        PackagePayment payment = new PackagePayment();
        payment.setCustomerId(request.getCustomerId());
        payment.setPackageId(request.getPackageId());
        payment.setTotalAmount(request.getTotalAmount());
        payment.setMethod(PaymentMethod.CASH);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setDescription("Thanh toán gói thuê pin bằng tiền mặt");
        payment.setStartDate(LocalDate.now());
        payment.setEndDate(LocalDate.now().plusDays(30));


        PackagePayment saved = packagePaymentRepository.save(payment);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Tạo thanh toán thành công", PackagePaymentDTO.fromEntity(saved))
        );
    }

    /**
     * ✅ Cập nhật trạng thái thanh toán
     */
    @Transactional
    public ResponseEntity<ResponseData<PackagePaymentDTO>> updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Optional<PackagePayment> optionalPayment = packagePaymentRepository.findById(paymentId);
        if (optionalPayment.isEmpty()) {
            throw new BusinessException(BillingException.PAYMENT_NOT_FOUND);
        }

        PackagePayment payment = optionalPayment.get();
        payment.setStatus(status);
        packagePaymentRepository.save(payment);

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Cập nhật trạng thái thành công", PackagePaymentDTO.fromEntity(payment))
        );
    }

    /**
     * ✅ Lấy thông tin thanh toán theo ID
     */
    public ResponseEntity<ResponseData<PackagePaymentDTO>> getPaymentById(Long paymentId) {
        PackagePayment payment = packagePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new BusinessException(BillingException.PAYMENT_NOT_FOUND));

        return ResponseEntity.ok(
                new ResponseData<>(HttpStatus.OK.value(), "Lấy thông tin thành công", PackagePaymentDTO.fromEntity(payment))
        );
    }
}
