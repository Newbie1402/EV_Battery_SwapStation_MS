package com.boilerplate.station.service;

import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.repository.StationRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.configurationprocessor.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeocodingService {
    @Value("${google.api.key}")
    private String apiKey;

    public Map<String, Double> getCoordinates(String address) {
        try {
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodedAddress + "&key=" + apiKey;

            RestTemplate restTemplate = new RestTemplate();
            String response = restTemplate.getForObject(url, String.class);

            JSONObject json = new JSONObject(response);
            if (!json.getString("status").equals("OK")) {
                throw new RuntimeException("Không tìm thấy tọa độ cho địa chỉ: " + address);
            }

            JSONObject location = json.getJSONArray("results")
                    .getJSONObject(0)
                    .getJSONObject("geometry")
                    .getJSONObject("location");

            double lat = location.getDouble("lat");
            double lng = location.getDouble("lng");

            Map<String, Double> result = new HashMap<>();
            result.put("latitude", lat);
            result.put("longitude", lng);
            return result;
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi gọi Geocoding API", e);
        }
    }


}
