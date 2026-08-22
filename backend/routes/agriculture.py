import logging
from fastapi import APIRouter

from backend.schemas.agriculture import FieldRequest, PredictionResponse
from agriculture.advisory.advisor import smart_advisor

logger = logging.getLogger("krishinetra.routes.agriculture")

router = APIRouter(tags=["Agriculture"])


@router.post("/predict", response_model=PredictionResponse)
def predict(request: FieldRequest):
    """Authoritative crop prediction and smart advisory endpoint."""
    report = smart_advisor(request.field_id)
    return report
