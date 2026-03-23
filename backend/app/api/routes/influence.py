from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.entities import InfluenceMetric, Influencer
from app.schemas import InfluenceMetricOut, InfluencerOut

router = APIRouter()


@router.get("/top", response_model=list[InfluencerOut])
def get_top_influencers(
    category: str | None = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[InfluencerOut]:
    query = db.query(Influencer)
    if category:
        query = query.filter(Influencer.category == category)
    return query.order_by(Influencer.impact_score.desc()).limit(limit).all()


@router.get("/metrics", response_model=list[InfluenceMetricOut])
def get_influence_metrics(db: Session = Depends(get_db)) -> list[InfluenceMetricOut]:
    return db.query(InfluenceMetric).all()


@router.get("/radar")
def get_influence_radar(db: Session = Depends(get_db)) -> list[dict[str, int | str]]:
    influencers = db.query(Influencer).order_by(Influencer.impact_score.desc()).limit(15).all()
    points = []
    for index, influencer in enumerate(influencers, start=1):
        points.append(
            {
                "id": influencer.id,
                "handle": influencer.handle,
                "x": 5 + (index * 11) % 90,
                "y": 8 + (index * 17) % 84,
                "size": max(16, min(44, influencer.impact_score // 2)),
                "impact_score": influencer.impact_score,
                "trust_score": influencer.trust_score,
                "posts_24h": influencer.posts_24h,
            }
        )
    return points
