package com.docurisk.backend.model.dto;

public class UploadResponseDTO {
    private String documentId;
    private String message;
    private String status;
    private DocumentDTO document;

    public UploadResponseDTO() {}

    public UploadResponseDTO(String documentId, String message, String status, DocumentDTO document) {
        this.documentId = documentId;
        this.message = message;
        this.status = status;
        this.document = document;
    }

    public String getDocumentId() { return documentId; }
    public void setDocumentId(String documentId) { this.documentId = documentId; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public DocumentDTO getDocument() { return document; }
    public void setDocument(DocumentDTO document) { this.document = document; }
}
