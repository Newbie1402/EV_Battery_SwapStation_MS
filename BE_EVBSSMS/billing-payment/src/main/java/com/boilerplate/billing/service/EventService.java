package com.boilerplate.billing.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class EventService {

    @Autowired
    @LoadBalanced  // bắt buộc nếu muốn gọi service qua Eureka
    private RestTemplate restTemplate;

    public String getStationString(Long id) {
        String serviceName = "STATION-SERVICE";
        String url = "http://" + serviceName + "/api/stations/" + id;

        ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody();
        } else {
            throw new RuntimeException("Error: " + response.getStatusCode());
        }
    }

}
