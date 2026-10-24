package com.docurisk.backend.repository;

import com.docurisk.backend.model.entity.DocumentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<DocumentEntity, String> {

    List<DocumentEntity> findAllByOrderByUploadedAtDesc();

    long countByStatus(String status);

    @Query("SELECT AVG(d.complianceScore) FROM DocumentEntity d WHERE d.complianceScore IS NOT NULL AND d.complianceScore > 0")
    Double findAverageComplianceScore();
}
