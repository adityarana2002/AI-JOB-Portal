package com.portal.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class YoutubeRecommendation {

    private String skill;
    private String channelName;
    private String searchQuery;
    private String reason;
}
