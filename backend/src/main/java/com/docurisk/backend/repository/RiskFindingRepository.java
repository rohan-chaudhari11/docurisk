package com.docurisk.backend.repository;

import com.docurisk.backend.model.entity.RiskFindingEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RiskFindingRepository extends JpaRepository<RiskFindingEntity, String> {

    List<RiskFindingEntity> findByDocumentId(String documentId);

    long countBySeverity(String severity);

    @Query("SELECT r.category, COUNT(r) FROM RiskFindingEntity r GROUP BY r.category")
    List<Object[]> countGroupedByCategory();
}
