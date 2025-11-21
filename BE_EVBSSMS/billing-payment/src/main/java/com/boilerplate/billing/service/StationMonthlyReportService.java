package com.boilerplate.billing.service;

import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.entity.StationMonthlyReport;
import com.boilerplate.billing.repository.SingleSwapPaymentRepository;
import com.boilerplate.billing.repository.StationMonthlyReportRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StationMonthlyReportService {

    private final SingleSwapPaymentRepository singleSwapPaymentRepository;
    private final StationMonthlyReportRepository stationMonthlyReportRepository;

    /**
     * Cron job: chạy tự động 00:01 ngày đầu tháng
     */
    @Scheduled(cron = "0 1 0 1 * ?")
    public void generateMonthlyReportAutomatically() {
        generateMonthlyReportForLastMonth();
        System.out.println(">>> Station monthly report generated automatically.");
    }

    /**
     * Tạo báo cáo cho tháng trước
     */
    @Transactional
    public void generateMonthlyReportForLastMonth() {
        LocalDate now = LocalDate.now();
        LocalDate lastMonth = now.minusMonths(1);

        int year = lastMonth.getYear();
        int month = lastMonth.getMonthValue();

        // Lấy tất cả SingleSwapPayment trong tháng
        List<SingleSwapPayment> payments = singleSwapPaymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null &&
                        p.getPaymentTime().getYear() == year &&
                        p.getPaymentTime().getMonthValue() == month)
                .collect(Collectors.toList());

        // Gom nhóm theo stationId (String)
        Map<String, List<SingleSwapPayment>> grouped = payments.stream()
                .collect(Collectors.groupingBy(p -> String.valueOf(p.getStationId())));

        for (Map.Entry<String, List<SingleSwapPayment>> entry : grouped.entrySet()) {
            String stationId = entry.getKey(); // đã là String
            List<SingleSwapPayment> stationPayments = entry.getValue();

            double totalRevenue = stationPayments.stream()
                    .mapToDouble(p -> Optional.ofNullable(p.getTotalAmount()).orElse(0.0))
                    .sum();

            long transactionCount = stationPayments.size();
            double averageRevenue = transactionCount == 0 ? 0 : totalRevenue / transactionCount;

            // Kiểm tra nếu report đã tồn tại thì update, chưa thì tạo mới
            StationMonthlyReport report = stationMonthlyReportRepository
                    .findByStationIdAndYearAndMonth(stationId, year, month)
                    .orElseGet(() -> StationMonthlyReport.builder()
                            .stationId(stationId)
                            .year(year)
                            .month(month)
                            .build());

            report.setRevenue(totalRevenue);
            report.setTransactions(transactionCount);
            report.setAverageRevenue(averageRevenue);
            report.setUpdatedAt(LocalDateTime.now());

            stationMonthlyReportRepository.save(report);
        }
    }
}
