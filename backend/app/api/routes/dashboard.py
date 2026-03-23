from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import Alert, Coin, TrendPoint
from app.schemas import CoinOut, DashboardSummary, TrendPointOut

router = APIRouter()


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)) -> DashboardSummary:
    tracked_coins = db.query(Coin).count()
    average_hype_score = db.query(func.avg(Coin.hype_score)).scalar() or 0
    average_trust_score = db.query(func.avg(Coin.trust_score)).scalar() or 0
    active_alerts = db.query(Alert).filter(Alert.status.in_(["active", "investigating"])).count()
    market_sentiment = db.query(func.avg(Coin.sentiment_score)).scalar() or 0

    return DashboardSummary(
        tracked_coins=tracked_coins,
        average_hype_score=round(float(average_hype_score), 2),
        average_trust_score=round(float(average_trust_score), 2),
        active_alerts=active_alerts,
        market_sentiment=round(float(market_sentiment), 2),
    )


@router.get("/trending", response_model=list[CoinOut])
def get_trending_coins(limit: int = Query(default=10, ge=1, le=100), db: Session = Depends(get_db)) -> list[CoinOut]:
    return db.query(Coin).order_by(Coin.hype_score.desc(), Coin.change_24h.desc()).limit(limit).all()


@router.get("/trend-chart", response_model=list[TrendPointOut])
def get_trend_chart(
    symbol: str | None = Query(default=None),
    limit: int = Query(default=40, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[TrendPointOut]:
    query = db.query(TrendPoint)
    if symbol:
        query = query.filter(TrendPoint.coin_symbol == symbol.upper())
    return query.order_by(TrendPoint.ts.desc()).limit(limit).all()
