package com.portal.application.repository;

import com.portal.application.entity.ApplicationStatus;
import com.portal.application.entity.JobApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByApplicantId(Long applicantId);

    List<JobApplication> findByJobId(Long jobId);

    boolean existsByApplicantIdAndJobId(Long applicantId, Long jobId);

    long countByApplicantId(Long applicantId);

    long countByApplicantIdAndStatus(Long applicantId, ApplicationStatus status);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.job.employer.id = :employerId")
    long countByJobEmployerId(@Param("employerId") Long employerId);

    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.job.employer.id = :employerId AND a.status = :status")
    long countByJobEmployerIdAndStatus(@Param("employerId") Long employerId, @Param("status") ApplicationStatus status);
}
