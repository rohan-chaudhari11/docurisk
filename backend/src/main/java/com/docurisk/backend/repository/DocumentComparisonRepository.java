package com.docurisk.backend.repository;

import com.docurisk.backend.model.entity.DocumentComparisonEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentComparisonRepository extends JpaRepository<DocumentComparisonEntity, String> {
    List<DocumentComparisonEntity> findAllByOrderByCreatedAtDesc();
}
