# DocuRisk AI — AI-Powered Document Summarizer & Risk Flagger

> **Enterprise Legal AI Suite**  
> An end-to-end full-stack legal engineering platform designed to ingest commercial contracts, synthesize executive summaries, detect high/medium/low severity risks with verbatim clause citations, and perform clause-by-clause redline version comparisons.

---

## 🏛️ System Architecture

The project is structured into four independent, decoupled top-level application folders:

```
DT project/
├── frontend/        # Next.js 16 Web Application (TypeScript, Tailwind CSS v4, Lucide React)
├── backend/         # Java Spring Boot 3.3 Application (Maven, Spring Data JPA, Hibernate)
├── database/        # MySQL 8.0+ Schemas, Flyway Migrations, Seed Data & Docker Compose
├── ai-service/      # Python FastAPI Microservice (Document Parsing, Summarization & Risk Engine)
├── .env.example     # Central environment variable reference template
├── .gitignore       # Multi-service source control exclusion rules
└── README.md        # Monorepo architecture & quickstart documentation
```

### High-Level Service Interaction

```
[ User Browser ]
       │
       ▼ (Port 3000)
[ frontend/ (Next.js 16) ] ──► Decoupled Service Layer (`documentService.ts`)
       │
       ▼ REST (Port 8080)
[ backend/ (Java Spring Boot 3.3) ]

       │
       ├──► (Port 3306) [ database/ (MySQL 8.0) ]
       │                   ├── documents
       │                   ├── analysis_summaries
       │                   ├── risk_findings
       │                   └── clause_diffs
       │
       └──► (Port 8000) [ ai-service/ (Python FastAPI) ]
                           ├── Text Extraction (pypdf, python-docx)
                           ├── Executive Summarization & Scoring
                           ├── Evidence-Backed Risk Detector
                           └── Clause-by-Clause Redline Diff Engine
```

---

## 📂 Top-Level Application Folders

### 1. `frontend/` — Next.js 16 Web Application
- **Path**: [`frontend/`](file:///d:/DT%20project/frontend)
- **Tech Stack**: Next.js 16 (App Router + Turbopack), React 19, TypeScript, Tailwind CSS v4, Lucide React.
- **Key Features**:
  - `/` — Centralized Compliance & Audit Dashboard with KPI widgets and risk charts.
  - `/upload` — Drag-and-drop contract ingestion with real-time pipeline visualization.
  - `/documents/[id]` — Detailed contract analysis, obligations, dates, and evidence inspector modal.
  - `/compare` — Interactive side-by-side split and unified redline diff viewer.
- **Status**: **Fully operational**. Compiles cleanly with zero TypeScript errors and zero ESLint warnings.

### 2. `backend/` — Java Spring Boot Application
- **Path**: [`backend/`](file:///d:/DT%20project/backend)
- **Tech Stack**: Java 17, Spring Boot 3.3.4, Spring Data JPA, Hibernate, MySQL Connector/J, Jakarta Validation.
- **Key Features**:
  - REST endpoints for documents (`/api/documents`), findings (`/api/findings`), comparisons (`/api/comparisons`), and health (`/api/health`).
  - Spring 6 `RestClient` orchestrating calls to the Python `ai-service`.
  - CORS configuration permitting requests from Next.js (`http://localhost:3000`).
  - Clean separation of Controllers, Services, JPA Entities, Repositories, and DTOs.
- **Status**: Codebase, entities, repositories, REST controllers, and Maven configuration complete. Ready to compile with Maven (`mvn spring-boot:run`).

### 3. `database/` — MySQL Database & Migrations
- **Path**: [`database/`](file:///d:/DT%20project/database)
- **Tech Stack**: MySQL 8.0+, Flyway-compatible migrations, Docker Compose.
- **Key Features**:
  - DDL schema scripts (`schema/01_init_schema.sql`) with foreign keys, indexes, and UTF8MB4 charset.
  - Versioned Flyway migrations (`migrations/V1__init_schema.sql`, `migrations/V2__seed_sample_contracts.sql`).
  - Rich seed datasets (`seeds/02_sample_contracts_seed.sql`) containing realistic enterprise contracts (MSAs, SLAs, software licenses, leases, and SOWs).
  - Standalone `docker-compose.yml` for instant local containerized setup.
- **Status**: Production-ready schemas, migrations, and seed scripts verified.

### 4. `ai-service/` — Python FastAPI AI Engine
- **Path**: [`ai-service/`](file:///d:/DT%20project/ai-service)
- **Tech Stack**: Python 3.13, FastAPI, Uvicorn, Pydantic v2, `pypdf`, `python-docx`.
- **Key Features**:
  - Multi-format text extraction (`.pdf`, `.docx`, `.txt`) with per-page tracking.
  - Evidence-backed risk detection engine scanning contracts for uncapped indemnity, unilateral termination, ambiguous breach windows, invasive audits, and IP assignment.
  - Executive summarization, milestone date extraction, and compliance scoring.
  - Clause-by-clause redline comparison engine calculating risk assessment deltas.
- **Status**: Core NLP and risk detection engines verified and tested. Endpoints defined and ready to serve with Uvicorn.

---

## 🚀 Quickstart Guide

### 1. Database Setup
```bash
cd database
docker compose up -d
```
*MySQL starts on `localhost:3306` with `docurisk_db` initialized and pre-seeded.*

### 2. AI Service Setup
```bash
cd ai-service
python -m venv .venv
# Activate virtual environment:
# Windows: .\.venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*API documentation available at [http://localhost:8000/docs](http://localhost:8000/docs).*

### 3. Backend Setup
The backend authenticates with MySQL using the `SPRING_DATASOURCE_PASSWORD` (or `DB_PASSWORD`) environment variable. Never commit or hardcode your real password in source files.

```bash
cd backend

# Supply your local MySQL password securely via environment variable:
# Windows PowerShell:
$env:SPRING_DATASOURCE_PASSWORD="<your_local_mysql_password>"
# Linux/macOS:
export SPRING_DATASOURCE_PASSWORD="<your_local_mysql_password>"

# Optional: Override username or database URL if different from defaults:
# $env:SPRING_DATASOURCE_USERNAME="<your_mysql_username>"
# $env:SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/docurisk_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"

# Run tests:
./mvnw test

# Start the Spring Boot backend service:
./mvnw spring-boot:run
```
*Spring Boot backend starts on `http://localhost:8080`.*

### 4. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Open [http://localhost:3000](http://localhost:3000) in your browser.*

---

## 🛡️ Quality & Verification Checklist

- [x] **Frontend Migration**: Moved to `frontend/` without breaking any imports or styles.
- [x] **Frontend Typecheck**: Passed (`npx tsc --noEmit`).
- [x] **Frontend Lint**: Passed (`npm run lint` — 0 errors, 0 warnings).
- [x] **Frontend Build**: Passed (`npm run build` — Turbopack compiled in < 400ms, 13 static/dynamic routes generated).
- [x] **Root Cleanliness**: All root node_modules, build artifacts, and legacy configs migrated.
- [x] **Database Isolation**: No raw DB server files or database storage directories in source control.
- [x] **Security**: Secrets, virtual environments, node_modules, and cache files excluded in `.gitignore`.


