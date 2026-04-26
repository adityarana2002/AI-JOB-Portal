package com.portal.job.repository;

import com.portal.job.entity.JobBookmark;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface JobBookmarkRepository extends JpaRepository<JobBookmark, Long> {

    Optional<JobBookmark> findByUserIdAndJobId(Long userId, Long jobId);

    boolean existsByUserIdAndJobId(Long userId, Long jobId);

    @Query("SELECT b FROM JobBookmark b JOIN FETCH b.job j WHERE b.user.id = :userId AND j.isActive = true ORDER BY b.createdAt DESC")
    List<JobBookmark> findActiveBookmarksByUserId(@Param("userId") Long userId);

    void deleteByUserIdAndJobId(Long userId, Long jobId);
}
