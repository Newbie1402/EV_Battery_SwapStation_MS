package com.boilerplate.billing;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
@EnableScheduling
public class BillingPaymentApplication {

	public static void main(String[] args) {
		SpringApplication.run(BillingPaymentApplication.class, args);
		System.out.println("Billing Payment chạy được rồi nè hẹ hẹ :))");
	}

}
