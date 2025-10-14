package com.boilerplate.station;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class StationInventoryApplication {

	public static void main(String[] args) {
		SpringApplication.run(StationInventoryApplication.class, args);
		System.out.println("Station Inventory running on port 8082");
	}

}
