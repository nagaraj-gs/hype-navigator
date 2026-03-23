from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Alert
from app.schemas import AlertCreate, AlertOut, AlertStatusUpdate

router = APIRouter()


@router.get("", response_model=list[AlertOut])
def list_alerts(
    severity: str | None = Query(default=None),
    status: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=200),
    db: Session = Depends(get_db),
) -> list[AlertOut]:
    query = db.query(Alert)
    if severity:
        query = query.filter(Alert.severity == severity)
    if status:
        query = query.filter(Alert.status == status)

    return query.order_by(Alert.created_at.desc()).limit(limit).all()


@router.post("", response_model=AlertOut, status_code=201)
def create_alert(payload: AlertCreate, db: Session = Depends(get_db)) -> AlertOut:
    alert = Alert(
        type=payload.type,
        title=payload.title,
        coin_symbol=payload.coin_symbol.upper(),
        message=payload.message,
        severity=payload.severity,
        status=payload.status,
        created_at=datetime.utcnow(),
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


@router.patch("/{alert_id}/status", response_model=AlertOut)
def update_alert_status(alert_id: int, payload: AlertStatusUpdate, db: Session = Depends(get_db)) -> AlertOut:
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

    alert.status = payload.status
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert
