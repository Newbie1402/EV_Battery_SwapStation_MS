package com.boilerplate.billing.client;

import com.boilerplate.billing.client.url.AuthUserApiUrls;
import com.boilerplate.billing.client.url.BookingUrls;
import com.boilerplate.billing.model.response.ResponseData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
@RequiredArgsConstructor
public class BookingClient {

    private final RestTemplate restTemplate;
    private final SimpleJwtTokenGenerator jwtTokenGenerator;
    private final ObjectMapper mapper = new ObjectMapper();

    @Value("${jwt.admin.email}")
    private String adminEmail;

    @Value("${jwt.admin.role}")
    private String adminRole;

    /**
     * Gọi PUT /api/stations/{id}/status
     * Không gửi body — chỉ có PathVariable id
     */
    public ResponseData<Void> updateBookingStatus(Long id) {

        String url = String.format(BookingUrls.CORMFIRMBOOKING, id);

        HttpEntity<Void> entity = new HttpEntity<>(createHeaders());

        ResponseEntity<ResponseData<Void>> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.PUT,
                        entity,
                        new ParameterizedTypeReference<ResponseData<Void>>() {}
                );

        if (response.getBody() == null) {
            throw new RuntimeException("Không nhận được phản hồi từ booking Service");
        }

        return response.getBody();
    }

    /**
     * Tạo header Authorization + JSON
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtTokenGenerator.generateToken1Min(adminEmail, adminRole));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
