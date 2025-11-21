package com.boilerplate.billing.service;

import com.boilerplate.billing.client.AuthUserClient;
import com.boilerplate.billing.model.DTO.PackagePaymentDTO;
import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.event.consumer.DTO.DriverDTO;
import com.boilerplate.billing.model.event.consumer.entity.Driver;
import com.boilerplate.billing.model.request.PackagePaymentRequest;
import com.boilerplate.billing.model.request.SingleSwapPaymentRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.repository.DriverRepository;
import com.boilerplate.billing.repository.PackagePaymentRepository;
import com.boilerplate.billing.repository.SingleSwapPaymentRepository;
import com.boilerplate.billing.model.DTO.SingleSwapPaymentDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PackagePaymentRepository packagePaymentRepository;
    private final SingleSwapPaymentRepository singleSwapPaymentRepository;

    @Autowired
    private AuthUserClient authUserClient;

    @Autowired
    private DriverRepository driverRepository;

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
        // 1. Lấy thông tin driver từ Auth Service
        DriverDTO driverDTO = authUserClient.getUserByBatteryId(request.getCustomerId());

        // 2. Kiểm tra xem driver đã có trong DB chưa
        Driver driver = driverRepository.findByEmployeeId(driverDTO.getEmployeeId()).orElse(null);

        // 3. Nếu chưa có -> tạo mới
        if (driver == null) {
            driver = new Driver();
        }

        // 4. Map từ DTO sang Entity (tự map)
        driver.setEmail(driverDTO.getEmail());
        driver.setPhone(driverDTO.getPhone());
        driver.setFullName(driverDTO.getFullName());
        driver.setAddress(driverDTO.getAddress());
        driver.setIdentityCard(driverDTO.getIdentityCard());
        driver.setEmployeeId(driverDTO.getEmployeeId());

        if (driverDTO.getBirthday() != null && !driverDTO.getBirthday().isEmpty()) {
            driver.setBirthday(LocalDate.parse(driverDTO.getBirthday()));
        }

        // 5. Lưu driver (upsert)
        driver = driverRepository.save(driver);

        // 6. Gán vào payment
        payment.setCustomerId(driver);
        payment.setTotalAmount(request.getTotalAmount());
        payment.setBaseAmount(request.getBaseAmount());
        payment.setDiscountAmount(request.getDiscountAmount());
        payment.setTaxAmount(request.getTaxAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(request.getStatus());
        payment.setBookingId(request.getBookingId());
        payment.setDescription(request.getDescription());
        payment.setPaymentTime(request.getPaymentTime());
        // 7. Lưu payment

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

        // 1. Lấy thông tin driver từ Auth Service
        DriverDTO driverDTO = authUserClient.getUserByBatteryId(request.getCustomerId());

        // 2. Kiểm tra xem driver đã có trong DB chưa
        Driver driver = driverRepository.findByEmployeeId(driverDTO.getEmployeeId()).orElse(null);

        // 3. Nếu chưa có -> tạo mới
        if (driver == null) {
            driver = new Driver();
        }

        // 4. Map từ DTO sang Entity (tự map)
        driver.setEmail(driverDTO.getEmail());
        driver.setPhone(driverDTO.getPhone());
        driver.setFullName(driverDTO.getFullName());
        driver.setAddress(driverDTO.getAddress());
        driver.setIdentityCard(driverDTO.getIdentityCard());
        driver.setEmployeeId(driverDTO.getEmployeeId());

        if (driverDTO.getBirthday() != null && !driverDTO.getBirthday().isEmpty()) {
            driver.setBirthday(LocalDate.parse(driverDTO.getBirthday()));
        }

        // 5. Lưu driver (upsert)
        driver = driverRepository.save(driver);

        // 6. Gán vào payment
        payment.setCustomerId(driver);
        payment.setTotalAmount(request.getTotalAmount());
        payment.setBaseAmount(request.getBaseAmount());
        payment.setDiscountAmount(request.getDiscountAmount());
        payment.setTaxAmount(request.getTaxAmount());
        payment.setMethod(request.getMethod());
        payment.setStatus(request.getStatus());
        payment.setBookingId(request.getBookingId());
        payment.setDescription(request.getDescription());
        payment.setPaymentTime(request.getPaymentTime());
        payment.setStationId(request.getStationId());
        payment.setPackageId(request.getPackageId());

        // 7. Lưu payment
        SingleSwapPayment saved = singleSwapPaymentRepository.save(payment);

        // 8. Response
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ResponseData<>(
                        HttpStatus.CREATED.value(),
                        "Single swap payment created successfully",
                        SingleSwapPaymentDTO.fromEntity(saved)
                ));
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
