from datetime import datetime

from pydantic import BaseModel, Field


class APIMessage(BaseModel):
    message: str


class HealthResponse(BaseModel):
    status: str = Field(default="ok")
    service: str
    environment: str
    timestamp: datetime
