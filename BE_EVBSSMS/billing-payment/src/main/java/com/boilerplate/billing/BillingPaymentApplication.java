package com.boilerplate.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
@EnableScheduling
@EnableFeignClients
public class BillingPaymentApplication {

	public static void main(String[] args) {
		SpringApplication.run(BillingPaymentApplication.class, args);
        System.out.println("Station Inventory running on port 9004");
	}

}
