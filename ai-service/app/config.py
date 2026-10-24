from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    app_name: str = "DocuRisk AI Document Analysis Engine"
    app_version: str = "1.0.0"
    port: int = 8000
    host: str = "0.0.0.0"
    debug: bool = True
    
    # Supported file extensions
    allowed_extensions: list[str] = [".pdf", ".docx", ".txt"]
    max_file_size_bytes: int = 25 * 1024 * 1024 # 25 MB
    
    # LLM integration parameters
    # Supported providers: "rule" (rule-based baseline), "openai", "gemini", "ollama", "local", "mock"
    llm_provider: str = "rule"
    llm_api_key: str = ""
    llm_base_url: str = "" # e.g. "https://api.openai.com/v1" or "http://localhost:11434/v1"
    llm_model: str = "gpt-4o-mini"
    llm_temperature: float = 0.1
    llm_max_tokens: int = 2048
    llm_timeout_seconds: float = 20.0
    
    # Document size protection & evidence verification
    llm_max_chars: int = 32000 # Truncate documents exceeding this character threshold
    verify_evidence: bool = True # Verify cited passage actually exists in source text
    reject_unverified_evidence: bool = False # If True, drop unverified findings; if False, flag as unverified

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
