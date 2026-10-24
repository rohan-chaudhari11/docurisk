package com.docurisk.backend.controller;

import com.docurisk.backend.model.dto.VersionComparisonDTO;
import com.docurisk.backend.service.ComparisonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comparisons")
public class ComparisonController {

    private final ComparisonService comparisonService;

    @Autowired
    public ComparisonController(ComparisonService comparisonService) {
        this.comparisonService = comparisonService;
    }

    @GetMapping
    public ResponseEntity<List<VersionComparisonDTO>> getAllComparisons() {
        return ResponseEntity.ok(comparisonService.getAllComparisons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VersionComparisonDTO> getComparisonById(@PathVariable String id) {
        return comparisonService.getComparisonById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
