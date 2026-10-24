package com.docurisk.backend.repository;

import com.docurisk.backend.model.entity.AnalysisSummaryEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisSummaryRepository extends JpaRepository<AnalysisSummaryEntity, Long> {
    Optional<AnalysisSummaryEntity> findByDocumentId(String documentId);
}
