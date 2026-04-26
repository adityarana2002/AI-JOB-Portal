package com.portal.auth.service;

import com.portal.notification.service.EmailService;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private final EmailService emailService;

    private static final int OTP_LENGTH = 6;
    private static final long OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private record OtpEntry(String code, Instant expiresAt) {}

    private final Map<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    public void sendOtp(String email) {
        String code = generateOtp();
        Instant expiresAt = Instant.now().plusSeconds(OTP_EXPIRY_MINUTES * 60);
        otpStore.put(email.toLowerCase().trim(), new OtpEntry(code, expiresAt));
        emailService.sendOtpEmail(email, code);
        log.info("OTP sent to {}", email);
    }

    public boolean verifyOtp(String email, String code) {
        String key = email.toLowerCase().trim();
        OtpEntry entry = otpStore.get(key);
        if (entry == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No OTP was sent to this email. Please request a new one.");
        }
        if (Instant.now().isAfter(entry.expiresAt())) {
            otpStore.remove(key);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired. Please request a new one.");
        }
        if (!entry.code().equals(code.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP. Please check and try again.");
        }
        otpStore.remove(key);
        return true;
    }

    public void clearOtp(String email) {
        otpStore.remove(email.toLowerCase().trim());
    }

    private String generateOtp() {
        StringBuilder sb = new StringBuilder(OTP_LENGTH);
        for (int i = 0; i < OTP_LENGTH; i++) {
            sb.append(RANDOM.nextInt(10));
        }
        return sb.toString();
    }
}
