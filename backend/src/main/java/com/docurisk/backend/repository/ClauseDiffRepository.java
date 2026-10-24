package com.docurisk.backend.repository;

import com.docurisk.backend.model.entity.ClauseDiffEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClauseDiffRepository extends JpaRepository<ClauseDiffEntity, String> {
    List<ClauseDiffEntity> findByComparisonIdOrderBySortOrderAsc(String comparisonId);
}
