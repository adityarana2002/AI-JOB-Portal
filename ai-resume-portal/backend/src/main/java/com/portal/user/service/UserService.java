package com.portal.user.service;

import com.portal.user.dto.UpdateProfileRequest;
import com.portal.user.dto.UserProfileResponse;
import com.portal.user.entity.User;
import com.portal.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserProfileResponse getProfile(Authentication auth) {
        return UserProfileResponse.from(resolveUser(auth));
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request, Authentication auth) {
        User user = resolveUser(auth);

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }
        if (request.phone() != null) {
            user.setPhone(request.phone().isBlank() ? null : request.phone().trim());
        }
        if (request.companyName() != null) {
            user.setCompanyName(request.companyName().isBlank() ? null : request.companyName().trim());
        }

        return UserProfileResponse.from(userRepository.save(user));
    }

    private User resolveUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }
}
