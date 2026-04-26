package com.portal.interview.dto;

import com.portal.interview.entity.InterviewType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ScheduleInterviewRequest(
    @NotNull Long applicationId,
    @NotNull @Future LocalDateTime scheduledAt,
    String meetingLink,
    @NotNull InterviewType interviewType,
    Integer durationMinutes,
    String message
) {}
