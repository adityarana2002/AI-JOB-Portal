package com.portal.application.dto;

import com.portal.application.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StatusUpdateRequest {

    @NotNull(message = "Status must not be null")
    private ApplicationStatus status;
}
