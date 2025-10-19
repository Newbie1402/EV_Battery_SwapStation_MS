package com.boilerplate.station.controller;


import com.boilerplate.station.service.GeocodingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/geocode")
@RequiredArgsConstructor
public class GeoAndRouteController {
    @Autowired
    private GeocodingService geocodingService;

    @GetMapping("/getposition")
    public ResponseEntity<?> getCoordinates(@RequestParam String address) {
        return ResponseEntity.ok(geocodingService.getCoordinates(address));
    }
}
