package com.docurisk.backend.controller;

import com.docurisk.backend.model.dto.RiskFindingDTO;
import com.docurisk.backend.model.entity.RiskFindingEntity;
import com.docurisk.backend.repository.RiskFindingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/findings")
public class FindingController {

    private final RiskFindingRepository findingRepository;

    @Autowired
    public FindingController(RiskFindingRepository findingRepository) {
        this.findingRepository = findingRepository;
    }

    @GetMapping
    public ResponseEntity<List<RiskFindingDTO>> getAllFindings(@RequestParam(required = false) String documentId) {
        List<RiskFindingEntity> entities = (documentId != null && !documentId.isBlank())
                ? findingRepository.findByDocumentId(documentId)
                : findingRepository.findAll();

        List<RiskFindingDTO> dtos = entities.stream()
                .map(f -> new RiskFindingDTO(
                        f.getId(),
                        f.getTitle(),
                        f.getSeverity(),
                        f.getCategory(),
                        f.getClauseReference(),
                        f.getExplanation(),
                        f.getEvidenceSnippet(),
                        f.getRecommendation(),
                        f.getPageNumber()
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RiskFindingDTO> getFindingById(@PathVariable String id) {
        return findingRepository.findById(id)
                .map(f -> new RiskFindingDTO(
                        f.getId(),
                        f.getTitle(),
                        f.getSeverity(),
                        f.getCategory(),
                        f.getClauseReference(),
                        f.getExplanation(),
                        f.getEvidenceSnippet(),
                        f.getRecommendation(),
                        f.getPageNumber()
                ))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
