//package com.boilerplate.station.model.entity;
//
//import com.boilerplate.station.enums.TaskStatus;
//import com.boilerplate.station.enums.TaskType;
//import jakarta.persistence.*;
//import lombok.AllArgsConstructor;
//import lombok.Getter;
//import lombok.NoArgsConstructor;
//import lombok.Setter;
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "station_tasks")
//@Getter
//@Setter
//@AllArgsConstructor
//@NoArgsConstructor
//public class StationTask {
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    private TaskType taskType;
//
//    @Enumerated(EnumType.STRING)
//    private TaskStatus status; // PENDING,COMPLETED, CANCELED
//
//    private LocalDateTime createdAt;
//    private LocalDateTime startedAt;
//    private LocalDateTime completedAt;
//
//    private String description; // ví dụ: "Đổi pin cho khách hàng A"
//
//    @ManyToOne
//    @JoinColumn(name = "station_id")
//    private Station station;
//
//    private Long bookingId; // liên kết tới Booking Service (liên service)
//}
