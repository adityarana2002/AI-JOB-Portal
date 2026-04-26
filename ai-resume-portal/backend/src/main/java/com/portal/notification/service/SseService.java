package com.portal.notification.service;

import com.portal.notification.dto.NotificationResponse;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
public class SseService {

    private static final long SSE_TIMEOUT = 30 * 60 * 1000L; // 30 minutes

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter register(Long userId) {
        // Remove existing emitter if any
        SseEmitter existing = emitters.remove(userId);
        if (existing != null) {
            existing.complete();
        }

        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        emitter.onCompletion(() -> {
            emitters.remove(userId);
            log.debug("SSE connection completed for user {}", userId);
        });
        emitter.onTimeout(() -> {
            emitters.remove(userId);
            log.debug("SSE connection timed out for user {}", userId);
        });
        emitter.onError(e -> {
            emitters.remove(userId);
            log.debug("SSE connection error for user {}: {}", userId, e.getMessage());
        });

        emitters.put(userId, emitter);
        log.info("SSE connection registered for user {}", userId);

        // Send initial heartbeat
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("{\"status\":\"connected\"}"));
        } catch (IOException e) {
            emitters.remove(userId);
        }

        return emitter;
    }

    public void push(Long userId, NotificationResponse notification) {
        SseEmitter emitter = emitters.get(userId);
        if (emitter == null) {
            return;
        }
        try {
            emitter.send(SseEmitter.event()
                .name("notification")
                .data(notification));
        } catch (IOException e) {
            emitters.remove(userId);
            log.debug("Failed to push SSE to user {}, removing emitter", userId);
        }
    }

    public void remove(Long userId) {
        SseEmitter emitter = emitters.remove(userId);
        if (emitter != null) {
            emitter.complete();
        }
    }
}
