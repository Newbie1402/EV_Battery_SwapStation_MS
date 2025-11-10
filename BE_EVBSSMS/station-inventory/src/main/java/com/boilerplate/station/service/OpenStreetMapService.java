package com.boilerplate.station.service;

import com.boilerplate.station.model.DTO.NearestStationDTO;
import com.boilerplate.station.model.entity.Station;
import com.boilerplate.station.model.response.ResponseData;
import com.boilerplate.station.repository.StationRepository;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;

@Service
public class OpenStreetMapService {

    @Autowired
    private StationRepository stationRepository;


    public record LocationDTO(double latitude, double longitude) {}

    /**
     * 🧭 Lấy tọa độ (latitude, longitude) từ địa chỉ bằng OpenStreetMap Nominatim API.
     */
    public LocationDTO getCoordinatesFromAddress(String address) {
        try {
            // Chuẩn hóa địa chỉ trước khi gửi
            String normalizedAddress = normalizeAddress(address);

            // Encode địa chỉ để tránh lỗi ký tự đặc biệt
            String encodedAddress = URLEncoder.encode(normalizedAddress, StandardCharsets.UTF_8);
            String urlString = "https://nominatim.openstreetmap.org/search?q=" + encodedAddress
                    + "&format=json&addressdetails=1&limit=1";

            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; OpenStreetMapService/1.0)");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) {
                response.append(line);
            }
            in.close();

            JSONArray results = new JSONArray(response.toString());

            if (results.length() > 0) {
                JSONObject first = results.getJSONObject(0);
                double lat = first.getDouble("lat");
                double lon = first.getDouble("lon");
                System.out.println(" Tọa độ tìm được cho \"" + normalizedAddress + "\": " + lat + ", " + lon);
                return new LocationDTO(lat, lon);
            }

            return null;

        } catch (Exception e) {
            System.err.println(" Lỗi khi gọi OSM API: " + e.getMessage());
            return null;
        }
    }

    /**
     * 🚗 Tính khoảng cách giữa 2 điểm (km) bằng OSRM API (Open Source Routing Machine).
     */
    public double getRouteDistance(double lat1, double lon1, double lat2, double lon2) {
        try {
            String urlString = String.format(
                    "https://router.project-osrm.org/route/v1/driving/%.6f,%.6f;%.6f,%.6f?overview=false",
                    lon1, lat1, lon2, lat2);

            HttpURLConnection conn = (HttpURLConnection) new URL(urlString).openConnection();
            conn.setRequestMethod("GET");
            conn.setRequestProperty("User-Agent", "Mozilla/5.0 (compatible; OpenStreetMapService/1.0)");

            BufferedReader in = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8));
            StringBuilder response = new StringBuilder();
            String line;
            while ((line = in.readLine()) != null) response.append(line);
            in.close();

            JSONObject json = new JSONObject(response.toString());
            if (!json.getString("code").equalsIgnoreCase("Ok")) {
                System.err.println("⚠️ OSRM không trả về route hợp lệ!");
                return -1;
            }

            JSONArray routes = json.getJSONArray("routes");
            if (routes.isEmpty()) return -1;

            double distanceMeters = routes.getJSONObject(0).getDouble("distance");
            return distanceMeters / 1000.0; // đổi sang km

        } catch (Exception e) {
            System.err.println(" Lỗi khi gọi OSRM API: " + e.getMessage());
            return -1;
        }
    }

    /**
     * Chuẩn hóa địa chỉ:
     * - Bỏ số nhà hoặc chữ "Số" ở đầu.
     * - Xóa khoảng trắng dư thừa.
     * - Giữ nguyên các từ khóa quan trọng như "Hẻm", "Ngõ".
     */
    private String normalizeAddress(String address) {
        if (address == null || address.isBlank()) return "";

        String cleaned = address.trim();

        // Nếu KHÔNG chứa các từ "Hẻm" hoặc "Ngõ", mới xóa số ở đầu
        if (!cleaned.toLowerCase().contains("hẻm") && !cleaned.toLowerCase().contains("ngõ")) {
            cleaned = cleaned.replaceAll("^(số|so)?\\s*\\d+[a-zA-Z/]*\\s*", "");
        }

        // Xóa dấu phẩy, dấu chấm đầu hoặc cuối
        cleaned = cleaned.replaceAll("^[,\\.\\-\\s]+|[,\\.\\-\\s]+$", "");

        return cleaned.trim();
    }


    public ResponseEntity<ResponseData<List<NearestStationDTO>>> findNearestStations(double userLat, double userLon) {
        List<Station> allStations = stationRepository.findAll();

        List<NearestStationDTO> nearestStations = allStations.stream()
                .sorted(Comparator.comparingDouble(s -> distance(userLat, userLon, s.getLatitude(), s.getLongitude())))
                .limit(5)
                .map(s -> NearestStationDTO.fromEntity(s,
                        distance(userLat, userLon, s.getLatitude(), s.getLongitude())))
                .toList();

        return ResponseEntity.ok(
                new ResponseData<>(
                        HttpStatus.OK.value(),
                        "Lấy 5 trạm gần nhất thành công",
                        nearestStations
                )
        );
    }

    private double distance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
