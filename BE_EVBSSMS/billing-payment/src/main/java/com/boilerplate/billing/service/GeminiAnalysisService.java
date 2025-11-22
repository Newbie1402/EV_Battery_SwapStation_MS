package com.boilerplate.billing.service;

import com.boilerplate.billing.client.StationClient;
import com.boilerplate.billing.model.event.consumer.DTO.StationSwapSummaryDTO;
import com.boilerplate.billing.model.response.ResponseData;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class GeminiAnalysisService {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper mapper = new ObjectMapper();
    private final StationClient stationClient;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    /**
     * Gửi tất cả swap summary hiện có lên AI để phân tích
     */
    public String analyzeAllSwapReports() {
        try {
            // Lấy dữ liệu từ StationClient
            List<StationSwapSummaryDTO> swapSummaries = stationClient.getAllSwapSummary();

            // Chuyển sang JSON
            String requestJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(swapSummaries);

            String prompt =
                    "Dựa trên danh sách tổng hợp swap pin trạm dưới đây, hãy phân tích cho từng trạm:\n" +
                            "- Báo cáo tần suất đổi pin, xác định giờ cao điểm\n" +
                            "- Dự đoán nhu cầu sử dụng trạm cho ngày hôm sau hoặc tuần tới\n" +
                            "- Đề xuất nâng cấp hạ tầng hoặc dịch vụ\n\n" +
                            "Yêu cầu:\n" +
                            "1. Trả lời dạng danh sách liệt kê, mỗi ý một dòng, bắt đầu bằng '- '\n" +
                            "2. Mỗi trạm bắt đầu bằng tên trạm và ngày\n" +
                            "3. Không dùng Markdown, không dùng dấu `*` hay `_`\n\n" +
                            "Dữ liệu JSON:\n" + requestJson;

            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(payload), headers);

            // Gọi API Gemini AI
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }

}
