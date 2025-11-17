package com.boilerplate.station;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
@EnableFeignClients
public class StationInventoryApplication {

	public static void main(String[] args) {
		SpringApplication.run(StationInventoryApplication.class, args);
		System.out.println("Station Inventory running on port 9002");
	}

}
