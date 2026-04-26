package com.portal.user.dto;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    @Size(min = 2, max = 100) String fullName,
    @Size(max = 20) String phone,
    @Size(max = 150) String companyName
) {}
