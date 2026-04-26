package com.portal;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class AiResumePortalApplication {

    public static void main(String[] args) {
        SpringApplication.run(AiResumePortalApplication.class, args);
    }
}
