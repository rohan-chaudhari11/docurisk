from fastapi import APIRouter
from app.services.diff_engine import compare_documents
from app.models.schemas import RedlineDiffRequest, RedlineDiffResponse

router = APIRouter(prefix="/api/ai", tags=["Comparison"])

@router.post("/diff", response_model=RedlineDiffResponse)
async def generate_diff_endpoint(payload: RedlineDiffRequest):
    """
    Performs clause-by-clause redline diff comparison between two contract versions.
    """
    return compare_documents(
        comparison_id=payload.comparison_id or "comp-custom",
        title=payload.title or "Contract Version Comparison",
        base_text=payload.base_text,
        target_text=payload.target_text,
        base_label=payload.base_label or "Original Version",
        target_label=payload.target_label or "Modified Version"
    )
