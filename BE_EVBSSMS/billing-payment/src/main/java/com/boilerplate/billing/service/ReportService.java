package com.boilerplate.billing.service;

import com.boilerplate.billing.model.entity.MonthlyReport;
import com.boilerplate.billing.model.entity.SingleSwapPayment;
import com.boilerplate.billing.model.entity.StationMonthlyReport;
import com.boilerplate.billing.model.request.ReportRequest;
import com.boilerplate.billing.model.response.ResponseData;
import com.boilerplate.billing.repository.MonthlyReportRepository;
import com.boilerplate.billing.repository.PackagePaymentRepository;
import com.boilerplate.billing.repository.SingleSwapPaymentRepository;
import com.boilerplate.billing.repository.StationMonthlyReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final PackagePaymentRepository packagePaymentRepository;
    private final SingleSwapPaymentRepository singleSwapPaymentRepository;
    private final MonthlyReportRepository monthlyReportRepository;
    private final StationMonthlyReportRepository stationMonthlyReportRepository;

    // =================== Báo cáo trung bình doanh thu theo tháng ===================
    public ResponseData<MonthlyReport> generateMonthlyReport(ReportRequest request) {
        int year = request.getYear();
        int month = request.getMonth();

        // Lấy tất cả PackagePayment và SingleSwapPayment trong tháng
        var packagePayments = packagePaymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null &&
                        p.getPaymentTime().getYear() == year &&
                        p.getPaymentTime().getMonthValue() == month)
                .toList();

        var singlePayments = singleSwapPaymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null &&
                        p.getPaymentTime().getYear() == year &&
                        p.getPaymentTime().getMonthValue() == month)
                .toList();

        // Tổng doanh thu
        double packageRevenue = packagePayments.stream()
                .mapToDouble(p -> Optional.ofNullable(p.getTotalAmount()).orElse(0.0))
                .sum();
        double stationRevenue = singlePayments.stream()
                .mapToDouble(p -> Optional.ofNullable(p.getTotalAmount()).orElse(0.0))
                .sum();
        double totalRevenue = packageRevenue + stationRevenue;

        // Số payment
        long packageCount = packagePayments.size();
        long stationCount = singlePayments.size();
        long totalCount = packageCount + stationCount;

        // Trung bình doanh thu trên mỗi payment
        double averageRevenue = totalCount == 0 ? 0 : totalRevenue / totalCount;

        MonthlyReport report = monthlyReportRepository.findByYearAndMonth(year, month)
                .orElse(MonthlyReport.builder()
                        .year(year)
                        .month(month)
                        .build());

        report.setPackageRevenue(packageRevenue);
        report.setStationRevenue(stationRevenue);
        report.setTotalRevenue(totalRevenue);
        report.setPackageTransactions(packageCount);
        report.setStationTransactions(stationCount);
        report.setTotalTransactions(totalCount);
        report.setAverageRevenue(averageRevenue); // thêm trường trung bình
        report.setUpdatedAt(LocalDateTime.now());

        monthlyReportRepository.save(report);

        return ResponseData.<MonthlyReport>builder()
                .statusCode(200)
                .message("Báo cáo trung bình doanh thu tháng/năm")
                .data(report)
                .build();
    }

//    // =================== Doanh thu theo từng trạm ===================
    public ResponseData<List<StationMonthlyReport>> generateStationMonthlyReport(ReportRequest request) {
        int year = request.getYear();
        int month = request.getMonth();

        var singlePayments = singleSwapPaymentRepository.findAll().stream()
                .filter(p -> p.getPaymentTime() != null &&
                        p.getPaymentTime().getYear() == year &&
                        p.getPaymentTime().getMonthValue() == month)
                .toList();

        Map<Long, List<SingleSwapPayment>> grouped = singlePayments.stream()
                .collect(Collectors.groupingBy(SingleSwapPayment::getStationId));

        List<StationMonthlyReport> reports = new ArrayList<>();

        for (var entry : grouped.entrySet()) {
            Long stationId = entry.getKey();
            List<SingleSwapPayment> payments = entry.getValue();

            double totalRevenue = payments.stream()
                    .mapToDouble(p -> Optional.ofNullable(p.getTotalAmount()).orElse(0.0))
                    .sum();
            long transactionCount = payments.size();
            double averageRevenue = transactionCount == 0 ? 0 : totalRevenue / transactionCount;

            StationMonthlyReport report = stationMonthlyReportRepository.findByStationIdAndYearAndMonth(stationId, year, month)
                    .orElse(StationMonthlyReport.builder()
                            .stationId(stationId)
                            .year(year)
                            .month(month)
                            .build());

            report.setRevenue(totalRevenue);
            report.setTransactions(transactionCount);
            report.setAverageRevenue(averageRevenue); // thêm trường trung bình cho từng trạm
            report.setUpdatedAt(LocalDateTime.now());

            stationMonthlyReportRepository.save(report);
            reports.add(report);
        }

        return ResponseData.<List<StationMonthlyReport>>builder()
                .statusCode(200)
                .message("Báo cáo doanh thu từng trạm")
                .data(reports)
                .build();
    }
}

