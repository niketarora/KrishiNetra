from pydantic import BaseModel


class FieldRequest(BaseModel):
    field_id: int


class PredictionResponse(BaseModel):
    label: int
    crop_name: str
    confidence: float

    latitude: float
    longitude: float

    moisture: float

    temperature: float
    humidity: float
    rain: float

    english: str
    hindi: str