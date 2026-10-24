-- =============================================================================
-- DocuRisk AI — Flyway Migration V1: Initial Schema
-- Target Engine: MySQL 8.0+
-- =============================================================================

CREATE TABLE IF NOT EXISTS `documents` (
  `id` VARCHAR(64) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(32) NOT NULL DEFAULT 'pdf',
  `file_size_bytes` BIGINT NOT NULL DEFAULT 0,
  `file_path` VARCHAR(512) NULL,
  `status` VARCHAR(32) NOT NULL DEFAULT 'uploaded',
  `overall_risk_level` VARCHAR(32) NULL,
  `compliance_score` INT NULL DEFAULT 0,
  `uploaded_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_documents_status` (`status`),
  INDEX `idx_documents_risk_level` (`overall_risk_level`),
  INDEX `idx_documents_uploaded_at` (`uploaded_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `analysis_summaries` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `document_id` VARCHAR(64) NOT NULL UNIQUE,
  `executive_summary` MEDIUMTEXT NOT NULL,
  `compliance_score` INT NOT NULL DEFAULT 0,
  `total_risks` INT NOT NULL DEFAULT 0,
  `high_risk_count` INT NOT NULL DEFAULT 0,
  `medium_risk_count` INT NOT NULL DEFAULT 0,
  `low_risk_count` INT NOT NULL DEFAULT 0,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_summaries_document` 
    FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `key_obligations` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `document_id` VARCHAR(64) NOT NULL,
  `obligation_text` TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_obligations_document_id` (`document_id`),
  CONSTRAINT `fk_obligations_document` 
    FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `critical_dates` (
  `id` BIGINT AUTO_INCREMENT NOT NULL,
  `document_id` VARCHAR(64) NOT NULL,
  `date_description` VARCHAR(255) NOT NULL,
  `date_value` VARCHAR(100) NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_dates_document_id` (`document_id`),
  CONSTRAINT `fk_critical_dates_document` 
    FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `risk_findings` (
  `id` VARCHAR(64) NOT NULL,
  `document_id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `severity` VARCHAR(32) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `clause_reference` VARCHAR(255) NOT NULL,
  `explanation` TEXT NOT NULL,
  `evidence_snippet` MEDIUMTEXT NOT NULL,
  `recommendation` TEXT NOT NULL,
  `page_number` INT NOT NULL DEFAULT 1,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_findings_document_id` (`document_id`),
  INDEX `idx_findings_severity` (`severity`),
  INDEX `idx_findings_category` (`category`),
  CONSTRAINT `fk_findings_document` 
    FOREIGN KEY (`document_id`) REFERENCES `documents` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `document_comparisons` (
  `id` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `base_document_id` VARCHAR(64) NULL,
  `target_document_id` VARCHAR(64) NULL,
  `base_version_label` VARCHAR(100) NOT NULL,
  `target_version_label` VARCHAR(100) NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_comparisons_base_doc` 
    FOREIGN KEY (`base_document_id`) REFERENCES `documents` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_comparisons_target_doc` 
    FOREIGN KEY (`target_document_id`) REFERENCES `documents` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `clause_diffs` (
  `id` VARCHAR(64) NOT NULL,
  `comparison_id` VARCHAR(64) NOT NULL,
  `clause_title` VARCHAR(255) NOT NULL,
  `diff_type` VARCHAR(32) NOT NULL,
  `severity` VARCHAR(32) NOT NULL,
  `old_text` MEDIUMTEXT NULL,
  `new_text` MEDIUMTEXT NULL,
  `risk_assessment` TEXT NOT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  INDEX `idx_clause_diffs_comparison_id` (`comparison_id`),
  INDEX `idx_clause_diffs_diff_type` (`diff_type`),
  INDEX `idx_clause_diffs_severity` (`severity`),
  CONSTRAINT `fk_clause_diffs_comparison` 
    FOREIGN KEY (`comparison_id`) REFERENCES `document_comparisons` (`id`) 
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
