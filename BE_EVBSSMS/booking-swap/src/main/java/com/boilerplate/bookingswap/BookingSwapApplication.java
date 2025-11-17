package com.boilerplate.bookingswap;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class BookingSwapApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookingSwapApplication.class, args);
        System.out.println("Station Inventory running on port 9003");
	}

}
