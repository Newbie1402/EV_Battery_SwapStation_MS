package com.boilerplate.billing.service;

import com.boilerplate.billing.model.DTO.PackagePaymentDTO;
import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.request.PackagePaymentRequest;
import com.boilerplate.billing.model.request.SingleSwapPaymentRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.repository.PackagePaymentRepository;
import com.boilerplate.billing.repository.SingleSwapPaymentRepository;
import com.boilerplate.billing.model.DTO.SingleSwapPaymentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PackagePaymentRepository packagePaymentRepository;
    private final SingleSwapPaymentRepository singleSwapPaymentRepository;

    //================= PACKAGE PAYMENT CRUD ===================
    public ResponseEntity<ResponseData<List<PackagePaymentDTO>>> getAllPackagePayments() {
        List<PackagePaymentDTO> payments = packagePaymentRepository.findAll()
                .stream().map(PackagePaymentDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(),
                "Fetched all package payments successfully", payments));
    }

    public ResponseEntity<ResponseData<PackagePaymentDTO>> getPackagePaymentById(Long id) {
        Optional<PackagePayment> found = packagePaymentRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Package payment not found", null));
        }
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(), "Package payment found",
                PackagePaymentDTO.fromEntity(found.get())));
    }

    public ResponseEntity<ResponseData<PackagePaymentDTO>> createPackagePayment(PackagePaymentRequest request) {
        PackagePayment payment = new PackagePayment();
        payment.setCustomerId(request.getCustomerId());
        payment.setTotalAmount(request.getTotalAmount());
        payment.setBaseAmount(request.getBaseAmount());
        payment.setDiscountAmount(request.getDiscountAmount());
        payment.setTaxAmount(request.getTaxAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(request.getStatus());
        payment.setBookingId(request.getBookingId());
        payment.setDescription(request.getDescription());
        payment.setPaymentTime(request.getPaymentTime());
        payment.setPackageId(request.getPackageId());
        payment.setStartDate(request.getStartDate());
        payment.setEndDate(request.getEndDate());

        PackagePayment saved = packagePaymentRepository.save(payment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Package payment created successfully",
                        PackagePaymentDTO.fromEntity(saved)));
    }

    public ResponseEntity<ResponseData<Void>> deletePackagePayment(Long id) {
        if (!packagePaymentRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Package payment not found", null));
        }
        packagePaymentRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(), "Package payment deleted successfully", null));
    }

    //================= SINGLE SWAP PAYMENT CRUD ===================
    public ResponseEntity<ResponseData<List<SingleSwapPaymentDTO>>> getAllSingleSwapPayments() {
        List<SingleSwapPaymentDTO> payments = singleSwapPaymentRepository.findAll()
                .stream().map(SingleSwapPaymentDTO::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(),
                "Fetched all single swap payments successfully", payments));
    }

    public ResponseEntity<ResponseData<SingleSwapPaymentDTO>> getSingleSwapPaymentById(Long id) {
        Optional<SingleSwapPayment> found = singleSwapPaymentRepository.findById(id);
        if (found.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Single swap payment not found", null));
        }
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(), "Single swap payment found",
                SingleSwapPaymentDTO.fromEntity(found.get())));
    }

    public ResponseEntity<ResponseData<SingleSwapPaymentDTO>> createSingleSwapPayment(SingleSwapPaymentRequest request) {
        SingleSwapPayment payment = new SingleSwapPayment();
        payment.setCustomerId(request.getCustomerId());
        payment.setTotalAmount(request.getTotalAmount());
        payment.setBaseAmount(request.getBaseAmount());
        payment.setDiscountAmount(request.getDiscountAmount());
        payment.setTaxAmount(request.getTaxAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(request.getStatus());
        payment.setBookingId(request.getBookingId());
        payment.setDescription(request.getDescription());
        payment.setPaymentTime(request.getPaymentTime());
        payment.setBookingId(request.getBookingId());
        payment.setStationId(request.getStationId());

        SingleSwapPayment saved = singleSwapPaymentRepository.save(payment);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(HttpStatus.CREATED.value(), "Single swap payment created successfully",
                        SingleSwapPaymentDTO.fromEntity(saved)));
    }

    public ResponseEntity<ResponseData<Void>> deleteSingleSwapPayment(Long id) {
        if (!singleSwapPaymentRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new ResponseData<>(HttpStatus.NOT_FOUND.value(), "Single swap payment not found", null));
        }
        singleSwapPaymentRepository.deleteById(id);
        return ResponseEntity.ok(new ResponseData<>(HttpStatus.OK.value(), "Single swap payment deleted successfully", null));
    }


}
