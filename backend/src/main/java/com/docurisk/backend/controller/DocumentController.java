package com.docurisk.backend.controller;

import com.docurisk.backend.model.dto.DashboardStatsDTO;
import com.docurisk.backend.model.dto.DocumentDTO;
import com.docurisk.backend.model.dto.UploadResponseDTO;
import com.docurisk.backend.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    private final DocumentService documentService;

    @Autowired
    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping
    public ResponseEntity<List<DocumentDTO>> getDocuments() {
        return ResponseEntity.ok(documentService.getAllDocuments());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentDTO> getDocumentById(@PathVariable String id) {
        return documentService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        return ResponseEntity.ok(documentService.getDashboardStats());
    }

    @PostMapping("/upload")
    public ResponseEntity<UploadResponseDTO> uploadDocument(@RequestParam("file") MultipartFile file) {
        try {
            DocumentDTO processed = documentService.uploadAndProcessDocument(file);
            UploadResponseDTO response = new UploadResponseDTO(
                    processed.getId(),
                    "Document successfully uploaded and analyzed.",
                    "success",
                    processed
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new UploadResponseDTO(null, e.getMessage(), "error", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new UploadResponseDTO(null, "Failed to process document: " + e.getMessage(), "error", null));
        }
    }
}
