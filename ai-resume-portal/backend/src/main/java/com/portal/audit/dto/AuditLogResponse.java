package com.portal.audit.dto;

import com.portal.audit.entity.AuditAction;
import com.portal.audit.entity.AuditLog;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private Long id;
    private Long actorId;
    private String actorEmail;
    private AuditAction action;
    private String targetType;
    private Long targetId;
    private String detail;
    private LocalDateTime createdAt;

    public static AuditLogResponse fromEntity(AuditLog log) {
        AuditLogResponse response = new AuditLogResponse();
        response.setId(log.getId());
        response.setActorId(log.getActorId());
        response.setActorEmail(log.getActorEmail());
        response.setAction(log.getAction());
        response.setTargetType(log.getTargetType());
        response.setTargetId(log.getTargetId());
        response.setDetail(log.getDetail());
        response.setCreatedAt(log.getCreatedAt());
        return response;
    }
}
