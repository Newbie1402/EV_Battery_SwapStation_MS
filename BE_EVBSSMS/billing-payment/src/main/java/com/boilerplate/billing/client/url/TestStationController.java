package com.boilerplate.billing.client.url;

import com.boilerplate.billing.client.StationClient;
import com.boilerplate.billing.model.event.consumer.DTO.DriverDTO;
import com.boilerplate.billing.model.event.consumer.DTO.StationDTO;
import com.boilerplate.billing.model.response.ResponseData;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test/station")
@RequiredArgsConstructor
public class TestStationController {

    private final StationClient stationClient;

    /**
     * Test lấy thông tin station bằng stationCode
     */
    @GetMapping("/{stationCode}")
    public ResponseEntity<ResponseData<StationDTO>> getStationByCode(
            @PathVariable("stationCode") String stationCode
    ) {

        StationDTO dto = stationClient.getStationByStationCode(stationCode);

        return ResponseEntity.ok(
                ResponseData.<StationDTO>builder()
                        .statusCode(200)
                        .message("Lấy thông tin station thành công")
                        .data(dto)
                        .build()
        );
    }
}
