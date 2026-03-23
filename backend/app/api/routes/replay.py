from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import ReplayEvent
from app.schemas import ReplayEventOut

router = APIRouter()


@router.get("/events", response_model=list[ReplayEventOut])
def get_replay_events(
    symbol: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=300),
    db: Session = Depends(get_db),
) -> list[ReplayEventOut]:
    query = db.query(ReplayEvent)
    if symbol:
        query = query.filter(ReplayEvent.coin_symbol == symbol.upper())
    return query.order_by(ReplayEvent.occurred_at.desc()).limit(limit).all()
