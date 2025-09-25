package com.boilerplate.eurekaserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

/**
 * Eureka Discovery Server cho hệ thống EV Battery Swap Station Management System
 * hệ thống khám phá dịch vụ, bằng cách đóng gói nó trong các container Docker để dễ dàng quản lý, triển khai và mở rộng
 */
@EnableEurekaServer
@SpringBootApplication
public class EurekaServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(EurekaServerApplication.class, args);
		System.out.println("🌟 Eureka Discovery Server đã khởi động thành công!");
		System.out.println("📍 Dashboard: http://localhost:8761");
	}
}
