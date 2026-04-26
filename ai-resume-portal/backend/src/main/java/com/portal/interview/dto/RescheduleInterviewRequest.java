package com.portal.interview.dto;

import com.portal.interview.entity.InterviewType;
import jakarta.validation.constraints.Future;
import java.time.LocalDateTime;

public record RescheduleInterviewRequest(
    @Future LocalDateTime scheduledAt,
    String meetingLink,
    InterviewType interviewType,
    Integer durationMinutes,
    String message
) {}
