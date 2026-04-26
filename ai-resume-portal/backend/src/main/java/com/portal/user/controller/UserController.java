package com.portal.user.controller;

import com.portal.user.dto.UpdateProfileRequest;
import com.portal.user.dto.UserProfileResponse;
import com.portal.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(Authentication auth) {
        return ResponseEntity.ok(userService.getProfile(auth));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
        @Valid @RequestBody UpdateProfileRequest request,
        Authentication auth
    ) {
        return ResponseEntity.ok(userService.updateProfile(request, auth));
    }
}
