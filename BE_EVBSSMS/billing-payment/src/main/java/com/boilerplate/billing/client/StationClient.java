package com.boilerplate.billing.client;

import com.boilerplate.billing.client.request.StationRequest;
import com.boilerplate.billing.client.url.AuthUserApiUrls;
import com.boilerplate.billing.client.url.StationUrls;
import com.boilerplate.billing.model.event.consumer.DTO.DriverDTO;
import com.boilerplate.billing.model.event.consumer.DTO.StationDTO;
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
public class StationClient {

    private final RestTemplate restTemplate;
    private final SimpleJwtTokenGenerator jwtTokenGenerator;
    private final ObjectMapper objectMapper = new ObjectMapper(); // Dùng để convert LinkedHashMap -> DTO

    @Value("${jwt.admin.email}")
    private String adminEmail;

    @Value("${jwt.admin.role}")
    private String adminRole;

    /**
     * Lấy driver theo batteryId
     */
    public StationDTO getStationByStationCode(String stationCode) {
        String url = String.format(StationUrls.GET_STATION_BY_CODE, stationCode);
        StationRequest request = new StationRequest();
        request.setCode(stationCode);
        HttpEntity<StationRequest> entity =
                new HttpEntity<>(request, createHeaders());
        ResponseEntity<ResponseData<StationDTO>> response =
                restTemplate.exchange(
                        url,
                        HttpMethod.POST,
                        entity,
                        new ParameterizedTypeReference<ResponseData<StationDTO>>() {}
                );
        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new RuntimeException("Không lấy được dữ liệu từ: " + url);
        }
        return objectMapper.convertValue(response.getBody().getData(), StationDTO.class);
    }

    /**
     * Tạo HttpEntity với Authorization header
     */
    private HttpEntity<Void> createHttpEntity() {
        return new HttpEntity<>(createHeaders());
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(jwtTokenGenerator.generateToken1Min(adminEmail, adminRole));
        headers.setContentType(MediaType.APPLICATION_JSON);
        return headers;
    }
}
