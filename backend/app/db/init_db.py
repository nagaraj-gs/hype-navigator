from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.models.entities import Alert, Coin, InfluenceMetric, Influencer, ReplayEvent, TrendPoint


def seed_database(db: Session) -> None:
    if db.query(Coin).count() > 0:
        return

    coins = [
        Coin(
            symbol="DOGE",
            name="Dogecoin",
            price=0.1823,
            market_cap=24100000000,
            volume_24h=2400000000,
            change_24h=12.4,
            hype_score=78,
            trust_score=87,
            sentiment_score=72,
            prediction="Up",
            prediction_confidence=73,
            risk_level="Medium",
        ),
        Coin(
            symbol="PEPE",
            name="Pepe",
            price=0.0000132,
            market_cap=5600000000,
            volume_24h=1100000000,
            change_24h=18.1,
            hype_score=85,
            trust_score=61,
            sentiment_score=76,
            prediction="Up",
            prediction_confidence=69,
            risk_level="High",
        ),
        Coin(
            symbol="SHIB",
            name="Shiba Inu",
            price=0.0000261,
            market_cap=15400000000,
            volume_24h=1900000000,
            change_24h=7.6,
            hype_score=74,
            trust_score=66,
            sentiment_score=68,
            prediction="Up",
            prediction_confidence=64,
            risk_level="High",
        ),
        Coin(
            symbol="WIF",
            name="dogwifhat",
            price=2.45,
            market_cap=2450000000,
            volume_24h=780000000,
            change_24h=-2.8,
            hype_score=70,
            trust_score=72,
            sentiment_score=59,
            prediction="Down",
            prediction_confidence=57,
            risk_level="Medium",
        ),
        Coin(
            symbol="BONK",
            name="Bonk",
            price=0.0000302,
            market_cap=2100000000,
            volume_24h=520000000,
            change_24h=-8.4,
            hype_score=63,
            trust_score=42,
            sentiment_score=38,
            prediction="Down",
            prediction_confidence=78,
            risk_level="Critical",
        ),
    ]
    db.add_all(coins)

    now = datetime.utcnow()
    trend_points = []
    for index in range(12):
        ts = now - timedelta(hours=(11 - index))
        trend_points.extend(
            [
                TrendPoint(coin_symbol="DOGE", ts=ts, mentions=200 + index * 20, sentiment=66 + index, price=0.16 + index * 0.002),
                TrendPoint(coin_symbol="PEPE", ts=ts, mentions=170 + index * 25, sentiment=60 + index, price=0.0000105 + index * 0.0000002),
                TrendPoint(coin_symbol="SHIB", ts=ts, mentions=120 + index * 12, sentiment=58 + index, price=0.000022 + index * 0.00000025),
            ]
        )
    db.add_all(trend_points)

    alerts = [
        Alert(type="danger", title="Pump Detected", coin_symbol="SHIB", message="Volume spike of 340% in 2h with coordinated social activity", severity="critical", status="active", created_at=now - timedelta(minutes=2)),
        Alert(type="danger", title="Wash Trading", coin_symbol="PEPE", message="Suspicious circular trading pattern detected across 12 wallets", severity="critical", status="active", created_at=now - timedelta(minutes=5)),
        Alert(type="warning", title="Unusual Spike", coin_symbol="PEPE", message="Mentions increased 180%, with 67% from new accounts", severity="high", status="active", created_at=now - timedelta(minutes=14)),
        Alert(type="danger", title="High Risk Coin", coin_symbol="BONK", message="Trust score dropped to 23. Multiple red flags detected.", severity="critical", status="investigating", created_at=now - timedelta(minutes=28)),
        Alert(type="info", title="Organic Growth", coin_symbol="PEPE", message="Steady 15% daily growth with diverse account sources", severity="low", status="resolved", created_at=now - timedelta(hours=3)),
    ]
    db.add_all(alerts)

    influencers = [
        Influencer(handle="CryptoKing", name="Crypto King", followers=2300000, trust_score=88, impact_score=94, posts_24h=42, category="analyst"),
        Influencer(handle="WhaleAlert", name="Whale Alert", followers=1800000, trust_score=82, impact_score=88, posts_24h=201, category="analytics"),
        Influencer(handle="AlphaLeaks", name="Alpha Leaks", followers=920000, trust_score=77, impact_score=81, posts_24h=57, category="news"),
    ]
    db.add_all(influencers)

    influence_metrics = [
        InfluenceMetric(influencer_handle="CryptoKing", metric="reach", value=95),
        InfluenceMetric(influencer_handle="CryptoKing", metric="trust", value=88),
        InfluenceMetric(influencer_handle="CryptoKing", metric="activity", value=70),
        InfluenceMetric(influencer_handle="WhaleAlert", metric="reach", value=80),
        InfluenceMetric(influencer_handle="WhaleAlert", metric="trust", value=82),
        InfluenceMetric(influencer_handle="WhaleAlert", metric="activity", value=90),
        InfluenceMetric(influencer_handle="AlphaLeaks", metric="reach", value=70),
        InfluenceMetric(influencer_handle="AlphaLeaks", metric="trust", value=77),
        InfluenceMetric(influencer_handle="AlphaLeaks", metric="activity", value=85),
    ]
    db.add_all(influence_metrics)

    replay_events = [
        ReplayEvent(coin_symbol="DOGE", event_type="mention-spike", description="Mentions rose 120% after influencer post", impact_score=82, occurred_at=now - timedelta(hours=1, minutes=10)),
        ReplayEvent(coin_symbol="PEPE", event_type="exchange-flow", description="Large wallet deposited 4.1T PEPE to exchange", impact_score=90, occurred_at=now - timedelta(hours=2, minutes=45)),
        ReplayEvent(coin_symbol="WIF", event_type="sentiment-shift", description="Sentiment shifted from bearish to neutral", impact_score=63, occurred_at=now - timedelta(hours=5)),
    ]
    db.add_all(replay_events)

    db.commit()
