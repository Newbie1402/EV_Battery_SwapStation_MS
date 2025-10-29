//package com.boilerplate.billing.service;
//
//import com.boilerplate.billing.enums.PaymentMethod;
//import com.boilerplate.billing.enums.PaymentStatus;
//import com.boilerplate.billing.model.entity.Payment;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.*;
//import org.springframework.stereotype.Service;
//import org.springframework.web.client.RestTemplate;
//
//import javax.crypto.Mac;
//import javax.crypto.spec.SecretKeySpec;
//import java.util.*;
//
//@Service
//public class MomoPaymentService {
//
//    private static final String MOMO_ENDPOINT = "https://test-payment.momo.vn/v2/gateway/api/create";
//    private static final String ACCESS_KEY = "F8BBA842ECF85";
//    private static final String SECRET_KEY = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
//    private static final String PARTNER_CODE = "MOMO";
//    private static final String REDIRECT_URL = "http://localhost:8082/api/payments/momo/return";
//    private static final String IPN_URL = "http://localhost:8082/api/payments/momo/ipn";
//
//    @Autowired
//    private PaymentRepository paymentRepository;
//
//    /**
//     * Tạo yêu cầu thanh toán qua MoMo Sandbox
//     */
//    public Map<String, Object> createPayment(double amount, Long orderId, Long customerId) throws Exception {
//        String requestId = UUID.randomUUID().toString();
//        String orderInfo = "Thanh toán đơn hàng #" + orderId;
//        String requestType = "captureWallet";
//        String extraData = "";
//
//        // 🔹 Tạo chuỗi ký
//        String rawSignature = String.format(
//                "accessKey=%s&amount=%s&extraData=%s&ipnUrl=%s&orderId=%s&orderInfo=%s&partnerCode=%s&redirectUrl=%s&requestId=%s&requestType=%s",
//                ACCESS_KEY, (long) amount, extraData, IPN_URL, orderId, orderInfo,
//                PARTNER_CODE, REDIRECT_URL, requestId, requestType
//        );
//
//        // 🔹 Sinh chữ ký
//        String signature = hmacSHA256(rawSignature, SECRET_KEY);
//
//        // 🔹 Payload gửi MoMo
//        Map<String, Object> payload = new LinkedHashMap<>();
//        payload.put("partnerCode", PARTNER_CODE);
//        payload.put("accessKey", ACCESS_KEY);
//        payload.put("requestId", requestId);
//        payload.put("amount", (long) amount);
//        payload.put("orderId", String.valueOf(orderId)); // MoMo yêu cầu orderId là String
//        payload.put("orderInfo", orderInfo);
//        payload.put("redirectUrl", REDIRECT_URL);
//        payload.put("ipnUrl", IPN_URL);
//        payload.put("extraData", extraData);
//        payload.put("requestType", requestType);
//        payload.put("lang", "vi");
//        payload.put("signature", signature);
//
//        // 🔹 Gửi request đến MoMo Sandbox
//        RestTemplate restTemplate = new RestTemplate();
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
//        ResponseEntity<Map> response = restTemplate.postForEntity(MOMO_ENDPOINT, entity, Map.class);
//
//        // 🔹 Lưu thông tin Payment vào DB
//        Payment payment = Payment.builder()
//                .bookingId(orderId)
//                .customerId(customerId)
//                .totalAmount(amount)
//                .method(PaymentMethod.MOMO)
//                .status(PaymentStatus.PENDING)
//                .description(orderInfo)
//                .build();
//        paymentRepository.save(payment);
//
//        return response.getBody();
//    }
//
//    /**
//     * Xử lý callback IPN từ MoMo
//     */
//    public void handleIPN(Map<String, Object> data) {
//        try {
//            Long orderId = Long.parseLong(String.valueOf(data.get("orderId")));
//            int resultCode = Integer.parseInt(String.valueOf(data.get("resultCode")));
//
//            Payment payment = paymentRepository.findByBookingId(orderId);
//            if (payment == null) return;
//
//            if (resultCode == 0) {
//                payment.setStatus(PaymentStatus.SUCCESS);
//            } else {
//                payment.setStatus(PaymentStatus.FAILED);
//            }
//            paymentRepository.save(payment);
//
//        } catch (Exception e) {
//            e.printStackTrace();
//        }
//    }
//
//    /**
//     * Sinh chữ ký HMAC SHA256
//     */
//    private String hmacSHA256(String data, String secretKey) throws Exception {
//        Mac sha256_HMAC = Mac.getInstance("HmacSHA256");
//        SecretKeySpec secret_key = new SecretKeySpec(secretKey.getBytes(), "HmacSHA256");
//        sha256_HMAC.init(secret_key);
//        byte[] hash = sha256_HMAC.doFinal(data.getBytes());
//        StringBuilder result = new StringBuilder();
//        for (byte b : hash) {
//            result.append(String.format("%02x", b));
//        }
//        return result.toString();
//    }
//}
