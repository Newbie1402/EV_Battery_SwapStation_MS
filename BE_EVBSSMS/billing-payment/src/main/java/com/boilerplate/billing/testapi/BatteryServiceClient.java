package com.boilerplate.billing.testapi;

import com.boilerplate.billing.client.SimpleJwtTokenGenerator;
import com.boilerplate.billing.model.response.ResponseData;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BatteryServiceClient {

    private final RestTemplate restTemplate;                 // RestTemplate có @LoadBalanced
    private final SimpleJwtTokenGenerator jwtTokenGenerator;

    // Gọi tới Station-Service qua Eureka (không dùng localhost)
    private final String stationServiceUrl = "http://STATION-SERVICE/api/batteries";

    // Constructor -> inject RestTemplate + TokenGenerator
    public BatteryServiceClient(RestTemplate restTemplate,
                                SimpleJwtTokenGenerator jwtTokenGenerator) {
        this.restTemplate = restTemplate;
        this.jwtTokenGenerator = jwtTokenGenerator;
    }

    /**
     * Lấy thông tin Battery theo id từ Station Service với token
     */
    public BatteryDTO getBatteryById(Long id) {
        String url = stationServiceUrl + "/get/" + id;

        // Tạo token 1 phút
        String token = jwtTokenGenerator.generateToken1Min("anhoa1794@gmail.com", "ROLE_ADMIN");

        // Set Authorization header: Bearer <token>
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ResponseEntity<ResponseData<BatteryDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                new ParameterizedTypeReference<ResponseData<BatteryDTO>>() {}
        );

        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new RuntimeException("Không lấy được Battery với id = " + id);
        }

        return response.getBody().getData();
    }
}
