package com.portal.interview.dto;

import java.time.LocalDateTime;

public record CandidateResponseRequest(
    boolean confirm,
    String candidateNote
) {}
