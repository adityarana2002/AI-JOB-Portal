package com.portal.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AiTestRequest {

    @NotBlank
    private String jobTitle;

    @NotBlank
    private String jobDescription;

    @NotBlank
    private String requiredSkills;

    private String experienceRequired;

    @NotBlank
    private String resumeText;
}
