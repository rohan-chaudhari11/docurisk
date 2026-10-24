package com.docurisk.backend.service;

import com.docurisk.backend.model.dto.ClauseDiffDTO;
import com.docurisk.backend.model.dto.VersionComparisonDTO;
import com.docurisk.backend.model.entity.ClauseDiffEntity;
import com.docurisk.backend.model.entity.DocumentComparisonEntity;
import com.docurisk.backend.repository.DocumentComparisonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ComparisonService {

    private final DocumentComparisonRepository comparisonRepository;

    @Autowired
    public ComparisonService(DocumentComparisonRepository comparisonRepository) {
        this.comparisonRepository = comparisonRepository;
    }

    @Transactional(readOnly = true)
    public List<VersionComparisonDTO> getAllComparisons() {
        return comparisonRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<VersionComparisonDTO> getComparisonById(String id) {
        return comparisonRepository.findById(id).map(this::mapToDTO);
    }

    private VersionComparisonDTO mapToDTO(DocumentComparisonEntity entity) {
        List<ClauseDiffDTO> diffDTOs = entity.getDiffs().stream()
                .map(d -> new ClauseDiffDTO(
                        d.getId(),
                        d.getClauseTitle(),
                        d.getDiffType(),
                        d.getSeverity(),
                        d.getOldText(),
                        d.getNewText(),
                        d.getRiskAssessment()
                ))
                .collect(Collectors.toList());

        return new VersionComparisonDTO(
                entity.getId(),
                entity.getTitle(),
                entity.getBaseDocument() != null ? entity.getBaseDocument().getId() : null,
                entity.getTargetDocument() != null ? entity.getTargetDocument().getId() : null,
                entity.getBaseVersionLabel(),
                entity.getTargetVersionLabel(),
                diffDTOs
        );
    }
}
