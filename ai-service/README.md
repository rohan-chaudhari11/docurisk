# DocuRisk AI — AI Service

> **FastAPI Python Microservice**  
> Responsible for document text extraction (`.pdf`, `.docx`, `.txt`), executive summarization, compliance scoring, evidence-backed contractual risk detection, and clause-by-clause redline diff comparisons.

---

## 🛠️ Technology Stack & Dependencies

- **Framework**: FastAPI (Async ASGI microservice)
- **ASGI Server**: Uvicorn
- **Data Validation**: Pydantic v2
- **Document Extractors**: `pypdf` (PDF text extraction), `python-docx` (Word DOCX extraction)
- **Testing**: Pytest & Starlette TestClient

---

## 🚀 Getting Started

### 1. Create and Activate Virtual Environment

```bash
# Windows
python -m venv .venv
.\.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Run the Development Server

```bash
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- Interactive ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/ai/health` | Healthcheck and service heartbeat |
| `POST` | `/api/ai/extract` | Multipart upload returning page-by-page extracted text |
| `POST` | `/api/ai/summarize` | Executive summary, key obligations, and milestone dates |
| `POST` | `/api/ai/analyze` | Full end-to-end pipeline: extraction, evidence-backed risk analysis, summary & scoring |
| `POST` | `/api/ai/diff` | Clause-by-clause redline comparison between two contracts |

---

## 🧪 Testing

```bash
pytest tests/ -v
```
