package com.docurisk.backend.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "key_obligations")
public class KeyObligationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentEntity document;

    @Column(name = "obligation_text", columnDefinition = "TEXT", nullable = false)
    private String obligationText;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public KeyObligationEntity() {
    }

    public KeyObligationEntity(DocumentEntity document, String obligationText, Integer sortOrder) {
        this.document = document;
        this.obligationText = obligationText;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentEntity getDocument() { return document; }
    public void setDocument(DocumentEntity document) { this.document = document; }

    public String getObligationText() { return obligationText; }
    public void setObligationText(String obligationText) { this.obligationText = obligationText; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
