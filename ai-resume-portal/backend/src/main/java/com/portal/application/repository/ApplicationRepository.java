package com.portal.application.repository;

import com.portal.application.entity.JobApplication;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    List<JobApplication> findByApplicantId(Long applicantId);

    List<JobApplication> findByJobId(Long jobId);
}
