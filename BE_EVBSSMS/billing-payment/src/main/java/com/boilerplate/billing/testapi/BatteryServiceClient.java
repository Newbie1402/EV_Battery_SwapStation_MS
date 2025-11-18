package com.boilerplate.billing.testapi;

import com.boilerplate.billing.model.response.ResponseData;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class BatteryServiceClient {

    private final RestTemplate restTemplate;
    private final String stationServiceUrl = "http://localhost:9002/api/batteries"; // Station Service port 9002

    public BatteryServiceClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Lấy thông tin Battery theo id từ Station Service
     */
    public BatteryDTO getBatteryById(Long id) {
        String url = stationServiceUrl + "/get/" + id;

        ResponseEntity<ResponseData<BatteryDTO>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<ResponseData<BatteryDTO>>() {}
        );
        if (response.getBody() == null || response.getBody().getData() == null) {
            throw new RuntimeException("Không lấy được Battery với id = " + id);
        }

        return response.getBody().getData();
    }
}
