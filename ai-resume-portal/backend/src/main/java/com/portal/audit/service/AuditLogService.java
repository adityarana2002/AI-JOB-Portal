package com.portal.audit.service;

import com.portal.audit.dto.AuditLogResponse;
import com.portal.audit.entity.AuditAction;
import com.portal.audit.entity.AuditLog;
import com.portal.audit.repository.AuditLogRepository;
import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Async
    public void log(Long actorId, String actorEmail, AuditAction action,
                    String targetType, Long targetId, String detail) {
        try {
            AuditLog entry = new AuditLog();
            entry.setActorId(actorId);
            entry.setActorEmail(actorEmail);
            entry.setAction(action);
            entry.setTargetType(targetType);
            entry.setTargetId(targetId);
            entry.setDetail(detail);
            auditLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to write audit log: action={}, target={}#{}, error={}",
                action, targetType, targetId, e.getMessage());
        }
    }

    public Page<AuditLogResponse> getLogs(AuditAction action, String search,
                                          int page, int size, Authentication auth) {
        requireSuperAdmin(auth);
        Pageable pageable = PageRequest.of(page, size);

        Page<AuditLog> results;
        boolean hasSearch = search != null && !search.isBlank();
        boolean hasAction = action != null;

        if (hasAction && hasSearch) {
            results = auditLogRepository.findByActionAndActorEmailContainingIgnoreCaseOrderByCreatedAtDesc(
                action, search, pageable);
        } else if (hasAction) {
            results = auditLogRepository.findByActionOrderByCreatedAtDesc(action, pageable);
        } else if (hasSearch) {
            results = auditLogRepository.findByActorEmailContainingIgnoreCaseOrderByCreatedAtDesc(
                search, pageable);
        } else {
            results = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        return results.map(AuditLogResponse::fromEntity);
    }

    private void requireSuperAdmin(Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        if (user.getRole() != Role.SUPER_ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Super admin access required");
        }
    }
}
