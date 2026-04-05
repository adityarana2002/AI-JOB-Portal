package com.portal.ai.dto;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LearningPlanItem {

    private String day;
    private String topic;
    private List<String> tasks;
    private Integer hours;
    private String priority;
}
