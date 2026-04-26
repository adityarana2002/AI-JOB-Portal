package com.portal.user.dto;

import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import java.time.LocalDateTime;

public record UserProfileResponse(
    Long id,
    String fullName,
    String email,
    Role role,
    String phone,
    String companyName,
    Boolean isActive,
    LocalDateTime createdAt
) {
    public static UserProfileResponse from(User u) {
        return new UserProfileResponse(
            u.getId(),
            u.getFullName(),
            u.getEmail(),
            u.getRole(),
            u.getPhone(),
            u.getCompanyName(),
            u.getIsActive(),
            u.getCreatedAt()
        );
    }
}
