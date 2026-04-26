package com.portal.application.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployerStatsResponse {
    private long activeJobs;
    private long totalApplications;
    private long shortlistedCount;
    private double avgMatchScore;
}
