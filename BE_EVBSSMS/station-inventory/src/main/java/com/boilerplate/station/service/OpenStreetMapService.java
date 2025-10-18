package com.boilerplate.station.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URLEncoder;
import java.net.URL;
import java.nio.charset.StandardCharsets;

@Service
public class OpenStreetMapService {

    public record LocationDTO(double latitude, double longitude) {}

    public LocationDTO getCoordinatesFromAddress(String address) {
        try {
            // Encode địa chỉ để tránh lỗi ký tự đặc biệt
            String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8);
            String urlString = "https://nominatim.openstreetmap.org/search?q=" + encodedAddress + "&format=json&addressdetails=1&limit=1";

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
                return new LocationDTO(lat, lon);
            }

            return null;

        } catch (Exception e) {
            System.err.println(" Lỗi khi gọi OSM API: " + e.getMessage());
            return null;
        }
    }

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
                System.err.println("OSRM không trả về route hợp lệ!");
                return -1;
            }

            JSONArray routes = json.getJSONArray("routes");
            if (routes.isEmpty()) return -1;

            double distanceMeters = routes.getJSONObject(0).getDouble("distance");
            return distanceMeters / 1000.0; // km

        } catch (Exception e) {
            System.err.println("Lỗi khi gọi OSRM API: " + e.getMessage());
            return -1;
        }
    }

}
