package com.portal.interview.repository;

import com.portal.interview.entity.Interview;
import com.portal.interview.entity.InterviewStatus;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {

    @Query("SELECT i FROM Interview i WHERE i.applicant.id = :userId ORDER BY i.scheduledAt ASC")
    List<Interview> findByApplicantId(@Param("userId") Long userId);

    @Query("SELECT i FROM Interview i WHERE i.employer.id = :employerId ORDER BY i.scheduledAt ASC")
    List<Interview> findByEmployerId(@Param("employerId") Long employerId);

    @Query("SELECT i FROM Interview i WHERE i.application.id = :applicationId")
    List<Interview> findByApplicationId(@Param("applicationId") Long applicationId);

    boolean existsByApplicationIdAndStatusNot(Long applicationId, InterviewStatus status);
}
