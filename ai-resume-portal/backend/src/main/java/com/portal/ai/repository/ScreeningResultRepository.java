package com.portal.ai.repository;

import com.portal.ai.entity.ScreeningResult;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ScreeningResultRepository extends JpaRepository<ScreeningResult, Long> {
    Optional<ScreeningResult> findByApplicationId(Long applicationId);
}
