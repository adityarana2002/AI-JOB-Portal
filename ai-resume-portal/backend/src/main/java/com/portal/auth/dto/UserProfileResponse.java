package com.portal.auth.dto;

import com.portal.user.entity.Role;
import com.portal.user.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String phone;
    private String companyName;
    private Boolean isActive;

    public static UserProfileResponse fromUser(User user) {
        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setPhone(user.getPhone());
        response.setCompanyName(user.getCompanyName());
        response.setIsActive(user.getIsActive());
        return response;
    }
}
