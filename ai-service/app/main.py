from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import health, extract, summarize, analyze, diff
from app.config import settings

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="High-performance legal AI document extraction, executive summarization, and evidence-backed risk analysis microservice.",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend (3000) and Spring Boot backend (8080)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register endpoints
app.include_router(health.router)
app.include_router(extract.router)
app.include_router(summarize.router)
app.include_router(analyze.router)
app.include_router(diff.router)

@app.get("/")
async def root():
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "status": "operational",
        "docs": "/docs",
        "endpoints": [
            "/api/ai/health",
            "/api/ai/extract",
            "/api/ai/summarize",
            "/api/ai/analyze",
            "/api/ai/diff"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.host, port=settings.port, reload=settings.debug)
