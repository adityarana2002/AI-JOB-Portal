package com.portal.audit.repository;

import com.portal.audit.entity.AuditAction;
import com.portal.audit.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    Page<AuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    Page<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action, Pageable pageable);

    Page<AuditLog> findByActorEmailContainingIgnoreCaseOrderByCreatedAtDesc(String email, Pageable pageable);

    Page<AuditLog> findByActionAndActorEmailContainingIgnoreCaseOrderByCreatedAtDesc(
        AuditAction action, String email, Pageable pageable
    );
}
