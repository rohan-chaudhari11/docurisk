# DocuRisk AI — Database Module

> **MySQL 8.0+ Database Schemas, Flyway Migrations & Seed Data**  
> Stores ingested contracts, analysis summaries, critical dates, contractual obligations, evidence-backed risk findings, and version diff redlines.

---

## 📁 Directory Structure

```
database/
├── docker-compose.yml          # Containerized MySQL 8.0 local instance
├── schema/
│   └── 01_init_schema.sql      # Standalone DDL creating database and tables
├── migrations/
│   ├── V1__init_schema.sql     # Flyway-compatible initial schema migration
│   └── V2__seed_sample_contracts.sql # Flyway-compatible seed migration
├── seeds/
│   └── 02_sample_contracts_seed.sql  # Rich test dataset matching mock contracts
└── README.md
```

---

## 🗄️ Relational Data Model

| Table | Description |
|---|---|
| `documents` | Core metadata (name, file type, file size, status, overall risk level, compliance score) |
| `analysis_summaries` | Executive summary, high/medium/low risk counts, compliance score |
| `key_obligations` | Extracted legal covenants and operational obligations |
| `critical_dates` | Milestone dates, renewal deadlines, and notice windows |
| `risk_findings` | Findings with severity (high, medium, low), category, clause citation, explanation, verbatim snippet, and recommendation |
| `document_comparisons` | Version comparison metadata (base vs target document) |
| `clause_diffs` | Clause redlines (old text, new text, diff type, severity, risk assessment) |

---

## 🚀 Running with Docker Compose

To start the MySQL 8 database with schema and sample seeds preloaded:

```bash
cd database
docker compose up -d
```

The database will be accessible at:
- **Host**: `localhost:3306`
- **Database**: `${MYSQL_DATABASE:-docurisk_db}`
- **User**: `${MYSQL_USER:-docurisk_user}`
- **Password**: Defined by `$env:MYSQL_PASSWORD` (or `MYSQL_PASSWORD` in your local environment)
- **Root Password**: Defined by `$env:MYSQL_ROOT_PASSWORD` (or `MYSQL_ROOT_PASSWORD`)

---

## 🛠️ Manual Execution against Local MySQL

If you already have a local MySQL server installed:

```bash
# 1. Initialize schema
mysql -u root -p < schema/01_init_schema.sql

# 2. Seed data
mysql -u root -p docurisk_db < seeds/02_sample_contracts_seed.sql
```
