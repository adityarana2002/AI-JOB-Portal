package com.portal.ai.entity;

import com.portal.application.entity.JobApplication;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "screening_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ScreeningResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "application_id", nullable = false, unique = true)
    private JobApplication application;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "is_eligible", nullable = false)
    private Boolean isEligible;

    @Column(name = "matched_skills", columnDefinition = "json")
    private String matchedSkills;

    @Column(name = "missing_skills", columnDefinition = "json")
    private String missingSkills;

    @Column(name = "strengths", columnDefinition = "json")
    private String strengths;

    @Column(name = "weaknesses", columnDefinition = "json")
    private String weaknesses;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "learning_plan", columnDefinition = "json")
    private String learningPlan;

    @Column(name = "youtube_links", columnDefinition = "json")
    private String youtubeLinks;

    @Column(name = "raw_ai_response", columnDefinition = "TEXT")
    private String rawAiResponse;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
