package com.portal.notification.dto;

import com.portal.notification.entity.Notification;
import com.portal.notification.entity.NotificationType;
import java.time.LocalDateTime;

public record NotificationResponse(
    Long id,
    NotificationType type,
    String title,
    String message,
    Long referenceId,
    String referenceType,
    boolean isRead,
    LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification n) {
        return new NotificationResponse(
            n.getId(),
            n.getType(),
            n.getTitle(),
            n.getMessage(),
            n.getReferenceId(),
            n.getReferenceType(),
            n.getIsRead(),
            n.getCreatedAt()
        );
    }
}
