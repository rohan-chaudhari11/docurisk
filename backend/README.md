# DocuRisk AI — Backend Service

> **Java Spring Boot 3.3 Application with Maven & JPA**  
> Acts as the central enterprise orchestration backend for DocuRisk AI: manages contract metadata in MySQL, exposes REST endpoints for the Next.js frontend, and delegates extraction and risk analysis to the Python FastAPI `ai-service`.

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: Spring Boot 3.3.4 (Java 17)
- **Data Persistence**: Spring Data JPA with Hibernate ORM
- **Database**: MySQL 8.0+ (`mysql-connector-j`)
- **HTTP Client**: Spring 6 `RestClient` (for Python AI microservice integration)
- **Validation**: Jakarta Bean Validation (`spring-boot-starter-validation`)
- **Testing**: JUnit 5 & Spring Boot Test

---

## 📁 Architecture & Package Structure

```
backend/
├── pom.xml
├── mvnw / mvnw.cmd
├── src/main/java/com/docurisk/backend/
│   ├── DocuRiskBackendApplication.java
│   ├── config/
│   │   ├── CorsConfig.java           # Permits Next.js frontend on http://localhost:3000
│   │   └── RestClientConfig.java     # Configures HTTP client for FastAPI AI service
│   ├── controller/
│   │   ├── DocumentController.java   # Document CRUD, stats, and upload orchestration
│   │   ├── FindingController.java    # Granular risk findings and citations
│   │   ├── ComparisonController.java # Contract version comparisons and redlines
│   │   └── HealthController.java     # Backend and AI service health monitor
│   ├── model/
│   │   ├── entity/                   # JPA Entity mappings (documents, findings, diffs, etc.)
│   │   └── dto/                      # Data Transfer Objects matching frontend types
│   ├── repository/                   # Spring Data JPA interfaces
│   └── service/                      # Business logic & AI service integration
└── src/main/resources/
    ├── application.properties        # MySQL connection and AI service URL
    └── application-dev.properties    # Development logging profile
```

---

## 📡 REST API Specification

| HTTP Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck returning backend status and AI service connection state |
| `GET` | `/api/documents` | List all uploaded and analyzed documents (ordered by upload time) |
| `GET` | `/api/documents/{id}` | Retrieve single document with executive summary, obligations & findings |
| `GET` | `/api/documents/stats` | Dashboard KPI aggregates (total documents, high/medium/low risks, average compliance score) |
| `POST` | `/api/documents/upload` | Multipart file upload; orchestrates analysis via Python AI service and persists to MySQL |
| `GET` | `/api/findings` | Filter findings by `documentId` or list all findings across contracts |
| `GET` | `/api/findings/{id}` | Inspect specific finding with verbatim evidence snippet |
| `GET` | `/api/comparisons` | List available contract version comparisons |
| `GET` | `/api/comparisons/{id}` | Retrieve clause-by-clause redlines and risk assessment deltas |

---

## 🚀 Running the Backend

### Prerequisites
1. **Java 17 JDK** installed (`java -version`)
2. **MySQL 8.0+** running on `localhost:3306` with database `docurisk_db` (or run via `cd ../database && docker compose up -d`)
3. **Python AI Service** running on `localhost:8000` (optional, graceful fallback provided)

### Build and Run with Maven

```bash
# If Apache Maven is installed:
mvn clean package
mvn spring-boot:run

# Or run using an IDE:
Open the backend/ directory in IntelliJ IDEA, Eclipse, or VS Code (with Java Extension Pack)
Run DocuRiskBackendApplication.java
```
