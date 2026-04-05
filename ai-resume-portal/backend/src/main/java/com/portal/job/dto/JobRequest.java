package com.portal.job.dto;

import com.portal.job.entity.JobType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class JobRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String requiredSkills;

    private String experienceRequired;

    private String salaryRange;

    @NotBlank
    private String location;

    @NotNull
    private JobType jobType;

    private LocalDate deadline;
}
