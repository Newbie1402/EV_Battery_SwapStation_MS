package com.boilerplate.billing.service;

import com.boilerplate.billing.enums.PaymentStatus;
import com.boilerplate.billing.enums.PaymentType;
import com.boilerplate.billing.exception.BillingException;
import com.boilerplate.billing.exception.BusinessException;
import com.boilerplate.billing.model.entity.BasePayment;
import com.boilerplate.billing.model.entity.PackagePayment;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.request.VNPAYRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.repository.PackagePaymentRepository;
import com.boilerplate.billing.repository.SingleSwapPaymentRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VnpayService {

    private final PackagePaymentRepository packagePaymentRepository;
    private final SingleSwapPaymentRepository singleSwapPaymentRepository;

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    // ================= TẠO URL THANH TOÁN =================
    public ResponseData<String> createPaymentUrl(VNPAYRequest request, HttpServletRequest httpRequest) {

        BasePayment payment = getPaymentByType(request.getType(), request.getPaymentId());

        if (payment.getTotalAmount() == null || payment.getTotalAmount() <= 0) {
            throw new BusinessException(BillingException.INVALID_PAYMENT_AMOUNT);
        }

        try {
            Map<String, String> params = new HashMap<>();
            params.put("vnp_Version", "2.1.0");
            params.put("vnp_Command", "pay");
            params.put("vnp_TmnCode", vnp_TmnCode);
            params.put("vnp_Amount", String.valueOf((long) (payment.getTotalAmount() * 100)));
            params.put("vnp_CurrCode", "VND");
            params.put("vnp_TxnRef", String.valueOf(payment.getId()));
            params.put("vnp_OrderInfo", "Thanh toan don hang #" + payment.getId());
            params.put("vnp_OrderType", "billpayment");
            params.put("vnp_Locale", "vn");
            params.put("vnp_ReturnUrl", vnp_ReturnUrl + "?type=" + request.getType());
            params.put("vnp_IpAddr", httpRequest.getRemoteAddr());
            params.put("vnp_CreateDate",
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss")));

            List<String> fieldNames = new ArrayList<>(params.keySet());
            Collections.sort(fieldNames);

            StringJoiner hashData = new StringJoiner("&");
            StringJoiner query = new StringJoiner("&");

            for (String fieldName : fieldNames) {
                String value = params.get(fieldName);
                hashData.add(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII) + "="
                        + URLEncoder.encode(value, StandardCharsets.US_ASCII));

                query.add(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII) + "="
                        + URLEncoder.encode(value, StandardCharsets.US_ASCII));
            }

            String vnp_SecureHash = hmacSHA512(vnp_HashSecret, hashData.toString());
            query.add("vnp_SecureHash=" + vnp_SecureHash);

            String paymentUrl = vnp_PayUrl + "?" + query;

            return ResponseData.<String>builder()
                    .statusCode(200)
                    .message("Tạo URL thanh toán thành công")
                    .data(paymentUrl)
                    .build();

        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException(BillingException.PAYMENT_GATEWAY_ERROR);
        }
    }

    // ================= XỬ LÝ CALLBACK =================
    public ResponseData<String> handleVnpayCallback(Map<String, String> params) {
        try {
            PaymentType type = PaymentType.valueOf(params.get("type"));

            Long paymentId = Long.parseLong(params.get("vnp_TxnRef"));
            BasePayment payment = getPaymentByType(type, paymentId);

            String vnp_SecureHash = params.get("vnp_SecureHash");

            Map<String, String> vnp_Params = params.entrySet().stream()
                    .filter(e -> e.getKey().startsWith("vnp_"))
                    .filter(e -> !e.getKey().equals("vnp_SecureHash"))
                    .filter(e -> !e.getKey().equals("vnp_SecureHashType"))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();

            for (String key : fieldNames) {
                String val = vnp_Params.get(key);
                if (val != null && !val.isEmpty()) {
                    hashData.append(URLEncoder.encode(key, StandardCharsets.US_ASCII));
                    hashData.append("=");
                    hashData.append(URLEncoder.encode(val, StandardCharsets.US_ASCII));
                    hashData.append("&");
                }
            }

            // Remove "&" cuối
            if (hashData.length() > 0) {
                hashData.deleteCharAt(hashData.length() - 1);
            }

            String checkHash = hmacSHA512(vnp_HashSecret, hashData.toString());

            if (!checkHash.equalsIgnoreCase(vnp_SecureHash)) {
                throw new BusinessException(BillingException.INVALID_SIGNATURE);
            }

            String vnp_ResponseCode = params.get("vnp_ResponseCode");

            if ("00".equals(vnp_ResponseCode)) {
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaymentTime(LocalDateTime.now());
                savePaymentByType(type, payment);
                return new ResponseData<>(200, "Thanh toán thành công", null);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                savePaymentByType(type, payment);
                return new ResponseData<>(400, "Thanh toán thất bại", null);
            }

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            e.printStackTrace();
            throw new BusinessException(BillingException.PAYMENT_GATEWAY_ERROR);
        }
    }

    // ================= HÀM PHỤ =================

    private BasePayment getPaymentByType(PaymentType type, Long id) {
        return switch (type) {
            case SINGLE -> singleSwapPaymentRepository.findById(id)
                    .orElseThrow(() -> new BusinessException(BillingException.PAYMENT_NOT_FOUND));
            case PACKAGE -> packagePaymentRepository.findById(id)
                    .orElseThrow(() -> new BusinessException(BillingException.PAYMENT_NOT_FOUND));
        };
    }

    private void savePaymentByType(PaymentType type, BasePayment payment) {
        switch (type) {
            case SINGLE -> singleSwapPaymentRepository.save((SingleSwapPayment) payment);
            case PACKAGE -> packagePaymentRepository.save((PackagePayment) payment);
        }
    }

    private String hmacSHA512(String key, String data) {
        try {
            Mac hmac = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac.init(secretKey);
            byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : bytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();

        } catch (Exception e) {
            throw new RuntimeException("Lỗi HMAC SHA512", e);
        }
    }
}
