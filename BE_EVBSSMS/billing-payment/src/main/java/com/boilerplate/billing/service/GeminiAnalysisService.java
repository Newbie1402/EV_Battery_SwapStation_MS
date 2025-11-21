package com.boilerplate.billing.service;

import com.boilerplate.billing.model.DTO.StationMonthlyReportDTO;
import com.boilerplate.billing.repository.StationMonthlyReportRepository;
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
    private final StationMonthlyReportRepository monthlyReportRepository;

    @Value("${gemini.api.url}")
    private String geminiApiUrl;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    /**
     * Lấy danh sách report rút gọn (DTO)
     */
    public List<StationMonthlyReportDTO> getAllReports() {
        return monthlyReportRepository.findAll()
                .stream()
                .map(r -> StationMonthlyReportDTO.builder()
                        .stationId(r.getStationId())
                        .year(r.getYear())
                        .month(r.getMonth())
                        .revenue(r.getRevenue())
                        .transactions(r.getTransactions())
                        .build())
                .toList();
    }

    /**
     * Gửi tất cả report hiện có lên Gemini để phân tích
     */
    public String analyzeAllReports() {
        try {
            List<StationMonthlyReportDTO> reports = getAllReports();
            String requestJson = mapper.writerWithDefaultPrettyPrinter().writeValueAsString(reports);

            String prompt =
                    "Dựa trên danh sách báo cáo trạm sạc dưới đây, hãy phân tích cho từng trạm:\n" +
                            "- So sánh tháng hiện tại và tháng trước (doanh thu, số giao dịch, doanh thu trung bình)\n" +
                            "- Dự đoán nhu cầu sử dụng trạm cho tháng tới\n" +
                            "- Đề xuất nâng cấp hạ tầng hoặc dịch vụ\n\n" +
                            "Yêu cầu:\n" +
                            "1. Trả lời dưới dạng danh sách liệt kê, mỗi ý một dòng, bắt đầu bằng ký tự '- '.\n" +
                            "2. Mỗi trạm bắt đầu bằng tên trạm và tháng.\n" +
                            "3. Không dùng Markdown, không dùng dấu `*` hay dấu `_`.\n\n" +
                            "Dữ liệu JSON:\n" + requestJson;


            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<String> entity = new HttpEntity<>(mapper.writeValueAsString(payload), headers);

            // Ghép URL + key từ properties
            String url = geminiApiUrl + "?key=" + geminiApiKey;

            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            return response.getBody();

        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
