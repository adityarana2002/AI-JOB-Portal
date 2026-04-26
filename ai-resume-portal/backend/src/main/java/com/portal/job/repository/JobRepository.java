package com.portal.job.repository;

import com.portal.job.entity.Job;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByEmployerId(Long employerId);

    List<Job> findByIsActiveTrue();

    long countByEmployerIdAndIsActiveTrue(Long employerId);
}
