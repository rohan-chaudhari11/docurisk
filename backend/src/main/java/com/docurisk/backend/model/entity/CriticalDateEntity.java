package com.docurisk.backend.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "critical_dates")
public class CriticalDateEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private DocumentEntity document;

    @Column(name = "date_description", nullable = false)
    private String dateDescription;

    @Column(name = "date_value")
    private String dateValue;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

    public CriticalDateEntity() {
    }

    public CriticalDateEntity(DocumentEntity document, String dateDescription, String dateValue, Integer sortOrder) {
        this.document = document;
        this.dateDescription = dateDescription;
        this.dateValue = dateValue;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public DocumentEntity getDocument() { return document; }
    public void setDocument(DocumentEntity document) { this.document = document; }

    public String getDateDescription() { return dateDescription; }
    public void setDateDescription(String dateDescription) { this.dateDescription = dateDescription; }

    public String getDateValue() { return dateValue; }
    public void setDateValue(String dateValue) { this.dateValue = dateValue; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }
}
