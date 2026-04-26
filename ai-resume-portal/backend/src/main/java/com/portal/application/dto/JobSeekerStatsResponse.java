package com.portal.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobSeekerStatsResponse {
    private long totalApplications;
    private long highMatchCount;
    private long shortlistedCount;
    private long pendingCount;
}
