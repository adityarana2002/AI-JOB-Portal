package com.portal.ai.repository;

import com.portal.ai.entity.ScreeningResult;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ScreeningResultRepository extends JpaRepository<ScreeningResult, Long> {
    Optional<ScreeningResult> findByApplicationId(Long applicationId);

    List<ScreeningResult> findByApplicationJobId(Long jobId);

    @Query("SELECT COALESCE(AVG(s.matchScore), 0.0) FROM ScreeningResult s WHERE s.application.job.employer.id = :employerId AND s.matchScore IS NOT NULL")
    Double avgMatchScoreByEmployerId(@Param("employerId") Long employerId);

    @Query("SELECT COUNT(s) FROM ScreeningResult s WHERE s.application.applicant.id = :applicantId AND s.matchScore >= :minScore")
    long countHighMatchByApplicantId(@Param("applicantId") Long applicantId, @Param("minScore") int minScore);
}
