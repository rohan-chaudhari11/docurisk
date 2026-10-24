package com.docurisk.backend.model.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "document_comparisons")
public class DocumentComparisonEntity {

    @Id
    @Column(name = "id", length = 64)
    private String id;

    @Column(name = "title", nullable = false)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "base_document_id")
    private DocumentEntity baseDocument;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_document_id")
    private DocumentEntity targetDocument;

    @Column(name = "base_version_label", nullable = false)
    private String baseVersionLabel;

    @Column(name = "target_version_label", nullable = false)
    private String targetVersionLabel;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "comparison", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ClauseDiffEntity> diffs = new ArrayList<>();

    public DocumentComparisonEntity() {
    }

    @PrePersist
    public void onPrePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public DocumentEntity getBaseDocument() { return baseDocument; }
    public void setBaseDocument(DocumentEntity baseDocument) { this.baseDocument = baseDocument; }

    public DocumentEntity getTargetDocument() { return targetDocument; }
    public void setTargetDocument(DocumentEntity targetDocument) { this.targetDocument = targetDocument; }

    public String getBaseVersionLabel() { return baseVersionLabel; }
    public void setBaseVersionLabel(String baseVersionLabel) { this.baseVersionLabel = baseVersionLabel; }

    public String getTargetVersionLabel() { return targetVersionLabel; }
    public void setTargetVersionLabel(String targetVersionLabel) { this.targetVersionLabel = targetVersionLabel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<ClauseDiffEntity> getDiffs() { return diffs; }
    public void setDiffs(List<ClauseDiffEntity> diffs) { this.diffs = diffs; }
}
