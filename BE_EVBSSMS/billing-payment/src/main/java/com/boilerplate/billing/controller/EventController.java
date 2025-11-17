package com.boilerplate.billing.controller;

import com.boilerplate.billing.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/billing")
public class EventController {

    @Autowired
    private EventService eventService;

    // GET từ frontend: /api/billing/station/{id}
    @GetMapping("/station/{id}")
    public ResponseEntity<String> getStationFromStationService(@PathVariable("id") Long id) {
        try {
            // Gọi service qua Eureka
            String stationData = eventService.getStationString(id);  // chỉnh method trả String
            return ResponseEntity.ok(stationData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error calling Station Service: " + e.getMessage());
        }
    }
}
