package com.portal.notification.service;

import com.portal.notification.dto.NotificationResponse;
import com.portal.notification.entity.Notification;
import com.portal.notification.entity.NotificationType;
import com.portal.notification.repository.NotificationRepository;
import com.portal.user.entity.User;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.portal.user.repository.UserRepository;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SseService sseService;

    public void send(User recipient, NotificationType type, String title, String message,
                     Long referenceId, String referenceType) {
        Notification n = new Notification();
        n.setRecipient(recipient);
        n.setType(type);
        n.setTitle(title);
        n.setMessage(message);
        n.setReferenceId(referenceId);
        n.setReferenceType(referenceType);
        notificationRepository.save(n);

        // Push via SSE in real-time
        try {
            sseService.push(recipient.getId(), NotificationResponse.from(n));
        } catch (Exception e) {
            // SSE push is best-effort, don't fail the operation
        }
    }

    public List<NotificationResponse> getMyNotifications(Authentication auth) {
        User user = resolveUser(auth);
        return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(user.getId())
                .stream().map(NotificationResponse::from).toList();
    }

    public Map<String, Long> getUnreadCount(Authentication auth) {
        User user = resolveUser(auth);
        long count = notificationRepository.countByRecipientIdAndIsReadFalse(user.getId());
        return Map.of("unread", count);
    }

    @Transactional
    public void markRead(Long id, Authentication auth) {
        User user = resolveUser(auth);
        Notification n = notificationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notification not found"));
        if (!n.getRecipient().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        }
        n.setIsRead(true);
        notificationRepository.save(n);
    }

    @Transactional
    public void markAllRead(Authentication auth) {
        User user = resolveUser(auth);
        notificationRepository.markAllReadByRecipientId(user.getId());
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
