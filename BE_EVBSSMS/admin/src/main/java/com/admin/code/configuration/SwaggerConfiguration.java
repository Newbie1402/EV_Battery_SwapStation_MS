package com.boilerplate.code.configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "swagger")
public class SwaggerConfiguration {
    private String appName;

    private String appDescription;

    private String appVersion;

    private String appLicense;

    private String appLicenseUrl;

    private String contactName;

    private String contactUrl;

    private String contactMail;

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title(appName)
                        .description(appDescription)
                        .version(appVersion)
                        .license(new License().name(appLicense).url(appLicenseUrl))
                        .contact(new Contact().name(contactName).url(contactUrl).email(contactMail))
                );
    }
}
